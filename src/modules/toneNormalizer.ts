import { ResumeDraft } from "../types";

export type ToneStyle = "concise" | "executive" | "technical";

const tonePrefixes: Record<ToneStyle, string> = {
  concise: "",
  executive: "Drove ",
  technical: "Engineered ",
};

export function normalizeTone(draft: ResumeDraft, style: ToneStyle): ResumeDraft {
  const experiences = draft.experiences.map((exp) => {
    const bullets = exp.bullets.map((b) => {
      const rewritten = b.rewritten ?? b.original;
      const prefix = tonePrefixes[style];
      const normalized = rewritten.startsWith(prefix) ? rewritten : `${prefix}${rewritten}`;
      return { ...b, rewritten: normalized, style };
    });
    return { ...exp, bullets };
  });
  return { ...draft, experiences };
}
