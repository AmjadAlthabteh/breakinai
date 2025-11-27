import { JDAnalysis, RankedSkill, ResumeDraft, TailoredResume } from "../types";
import { enhanceActionVerbs } from "./bulletRewriter";

export function tailorResume(draft: ResumeDraft, jd: JDAnalysis, style: "concise" | "executive" | "technical"): TailoredResume {
  const missingSet = new Set(jd.missing_skills.map((s) => s.toLowerCase()));
  const ranked: RankedSkill[] = draft.skills.map((skill) => ({
    skill,
    source: "work_history",
    user_has: true,
    missing: missingSet.has(skill.toLowerCase()),
  }));

  const ats_keywords_added: string[] = [];
  const bullets = draft.experiences.flatMap((exp) =>
    exp.bullets.map((b) => {
      let rewritten = b.rewritten ?? b.original;
      rewritten = enhanceActionVerbs(rewritten);
      for (const kw of jd.required_skills) {
        if (!rewritten.toLowerCase().includes(kw.toLowerCase()) && ats_keywords_added.length < 6) {
          rewritten = `${rewritten} (${kw})`;
          ats_keywords_added.push(kw);
        }
      }
      return { ...b, rewritten, style };
    })
  );

  const warnings = jd.missing_skills.map((s) => `Missing required skill: ${s}`);
  const summary = `${draft.summary} | Tailored for ${jd.seniority_cues.join(", ") || "role"} with focus on ${jd.required_skills.join(", ")}`;

  return {
    summary,
    skills_ranked: ranked,
    bullets,
    ats_keywords_added,
    style,
    warnings,
  };
}
