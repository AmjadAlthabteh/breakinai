import { JDAnalysis, ResumeDraft } from "../types";

export function atsOptimize(draft: ResumeDraft, jd: JDAnalysis): ResumeDraft {
  const keywordSet = new Set(jd.required_skills.concat(jd.preferred_skills));
  const ats_keywords_added: string[] = [];

  const experiences = draft.experiences.map((exp) => {
    const bullets = exp.bullets.map((b) => {
      let rewritten = b.rewritten ?? b.original;
      for (const kw of keywordSet) {
        if (!rewritten.toLowerCase().includes(kw.toLowerCase()) && ats_keywords_added.length < 10) {
          // Insert keyword near the end to avoid stuffing; keep phrasing natural.
          rewritten = `${rewritten} (${kw})`;
          ats_keywords_added.push(kw);
        }
      }
      return { ...b, rewritten };
    });
    return { ...exp, bullets };
  });

  const skills = Array.from(new Set(draft.skills.concat(Array.from(keywordSet))));
  return {
    ...draft,
    experiences,
    skills,
    warnings: draft.warnings,
  };
}
