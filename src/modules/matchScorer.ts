import { JDAnalysis, MatchScore, TailoredResume } from "../types";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * Enhanced job matching algorithm with weighted scoring
 * Considers multiple factors with intelligent weighting
 */
export function scoreMatch(tailored: TailoredResume, jd: JDAnalysis): MatchScore {
  const skillNames = new Set(tailored.skills_ranked.map((s) => s.skill.toLowerCase()));
  const reqMatches = jd.required_skills.filter((s) => skillNames.has(s.toLowerCase()));
  const prefMatches = jd.preferred_skills.filter((s) => skillNames.has(s.toLowerCase()));

  // Calculate coverage scores
  const reqCoverage = jd.required_skills.length ? reqMatches.length / jd.required_skills.length : 1;
  const prefCoverage = jd.preferred_skills.length ? prefMatches.length / jd.preferred_skills.length : 1;

  // Enhanced keyword coverage with partial matching bonus
  const keywordCoverage = clamp(reqCoverage * 0.7 + prefCoverage * 0.3, 0, 1);

  // Improved seniority alignment with gradual scoring
  let seniority_alignment = 0.7; // default
  const seniorityLevel = jd.seniority_cues.length;
  if (seniorityLevel >= 3) {
    seniority_alignment = 1.0; // strong match
  } else if (seniorityLevel >= 2) {
    seniority_alignment = 0.85; // good match
  } else if (seniorityLevel >= 1) {
    seniority_alignment = 0.75; // decent match
  }

  // Enhanced domain alignment with multiple signal types
  let domain_alignment = 0.6; // base score
  const domainSignals = jd.hidden_signals.filter((s) => s.type === "domain");
  const atsSignals = jd.hidden_signals.filter((s) => s.type === "ats_tag");
  const toneSignals = jd.hidden_signals.filter((s) => s.type === "tone");

  if (domainSignals.length >= 2) domain_alignment += 0.2;
  else if (domainSignals.length >= 1) domain_alignment += 0.1;
  if (atsSignals.length >= 1) domain_alignment += 0.05;
  if (toneSignals.length >= 1) domain_alignment += 0.05;
  domain_alignment = clamp(domain_alignment, 0, 1);

  // Quality bonus for comprehensive skill matches
  const comprehensiveBonus = reqCoverage >= 0.8 && prefCoverage >= 0.5 ? 0.05 : 0;

  // Penalty for keyword stuffing (progressive)
  let stuffingPenalty = 0;
  if (tailored.ats_keywords_added.length > 15) stuffingPenalty = 15;
  else if (tailored.ats_keywords_added.length > 10) stuffingPenalty = 8;
  else if (tailored.ats_keywords_added.length > 7) stuffingPenalty = 3;

  // Weighted scoring with enhanced factors
  // Required skills: 40% (most important)
  // Preferred skills: 20% (nice to have)
  // Domain alignment: 18% (industry fit)
  // Seniority alignment: 17% (experience level)
  // Comprehensive bonus: 5% (well-rounded candidate)
  const score =
    100 *
      (0.40 * reqCoverage +
        0.20 * prefCoverage +
        0.18 * domain_alignment +
        0.17 * seniority_alignment +
        comprehensiveBonus) -
    stuffingPenalty;

  // Enhanced rationale with actionable insights
  const rationale = [
    `✓ Required skills: ${(reqCoverage * 100).toFixed(0)}% (${reqMatches.length}/${jd.required_skills.length})`,
    `✓ Preferred skills: ${(prefCoverage * 100).toFixed(0)}% (${prefMatches.length}/${jd.preferred_skills.length})`,
    `✓ Domain alignment: ${(domain_alignment * 100).toFixed(0)}% (${domainSignals.length} signals)`,
    `✓ Seniority match: ${(seniority_alignment * 100).toFixed(0)}% (${jd.seniority_cues.join(", ") || "entry-level"})`,
    comprehensiveBonus ? `✓ Comprehensive match bonus: +${(comprehensiveBonus * 100).toFixed(0)}%` : "",
    stuffingPenalty ? `⚠ Keyword stuffing penalty: -${stuffingPenalty}` : "✓ Natural keyword integration",
  ].filter(Boolean);

  // Enhanced strengths with prioritization
  const strengths = [
    ...reqMatches.slice(0, 5).map(s => `Strong: ${s}`),
    ...prefMatches.slice(0, 3).map(s => `Nice-to-have: ${s}`)
  ];

  return {
    score_0_100: clamp(Math.round(score), 0, 100),
    rationale,
    strengths,
    gaps: jd.missing_skills,
    keyword_coverage: keywordCoverage,
    seniority_alignment,
    domain_alignment,
  };
}
