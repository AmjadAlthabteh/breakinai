import { JDAnalysis, MatchScore, TailoredResume } from "../types";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function scoreMatch(tailored: TailoredResume, jd: JDAnalysis): MatchScore {
  const skillNames = new Set(tailored.skills_ranked.map((s) => s.skill.toLowerCase()));
  const reqMatches = jd.required_skills.filter((s) => skillNames.has(s.toLowerCase()));
  const prefMatches = jd.preferred_skills.filter((s) => skillNames.has(s.toLowerCase()));

  const reqCoverage = jd.required_skills.length ? reqMatches.length / jd.required_skills.length : 1;
  const prefCoverage = jd.preferred_skills.length ? prefMatches.length / jd.preferred_skills.length : 1;

  const keywordCoverage = clamp(reqCoverage * 0.7 + prefCoverage * 0.3, 0, 1);

  const seniority_alignment = jd.seniority_cues.length > 0 ? 1 : 0.7;
  const domain_alignment = jd.hidden_signals.some((s) => s.type === "domain") ? 0.8 : 0.6;

  const stuffingPenalty = tailored.ats_keywords_added.length > 10 ? 10 : 0;

  const score =
    100 *
      (0.45 * reqCoverage +
        0.2 * prefCoverage +
        0.15 * domain_alignment +
        0.15 * seniority_alignment +
        0.05 * 1) -
    stuffingPenalty;

  const rationale = [
    `Required coverage: ${(reqCoverage * 100).toFixed(0)}% (${reqMatches.length}/${jd.required_skills.length})`,
    `Preferred coverage: ${(prefCoverage * 100).toFixed(0)}% (${prefMatches.length}/${jd.preferred_skills.length})`,
    `Domain alignment: ${domain_alignment}`,
    `Seniority cues present: ${jd.seniority_cues.join(", ") || "none"}`,
    stuffingPenalty ? `Penalty applied for possible keyword stuffing (${stuffingPenalty})` : "No stuffing penalty",
  ];

  return {
    score_0_100: clamp(Math.round(score), 0, 100),
    rationale,
    strengths: reqMatches,
    gaps: jd.missing_skills,
    keyword_coverage: keywordCoverage,
    seniority_alignment,
    domain_alignment,
  };
}
