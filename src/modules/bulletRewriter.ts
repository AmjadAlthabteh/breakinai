import { Bullet, ResumeDraft } from "../types";
import { LLMClient, LLMMessage, systemGuardrails } from "../llm";

const actionVerbs = [
  "Led",
  "Built",
  "Shipped",
  "Reduced",
  "Accelerated",
  "Automated",
  "Designed",
  "Improved",
  "Deployed",
  "Secured",
];

const bulletPrompt = (bullet: Bullet) => `
Rewrite the bullet with the CAR framework (Context, Action, Result).
Rules: start with a strong action verb, under 30 words, keep metrics, ATS-safe, do not fabricate.
Input bullet: "${bullet.original}"
Return JSON: { "rewritten": "...", "skills_used": [] }`;

export async function rewriteBulletsCAR(draft: ResumeDraft, llm: LLMClient): Promise<ResumeDraft> {
  const experiences = [];
  for (const exp of draft.experiences) {
    const bullets: Bullet[] = [];
    for (const b of exp.bullets) {
      const messages: LLMMessage[] = [
        { role: "system", content: systemGuardrails },
        { role: "user", content: bulletPrompt(b) },
      ];
      const res = await llm.complete(messages, { model: "gpt-4o-mini", temperature: 0.2 });
      let parsed: { rewritten: string; skills_used?: string[] };
      try {
        parsed = JSON.parse(res.text);
      } catch {
        parsed = { rewritten: b.original, skills_used: [] };
      }
      bullets.push({
        ...b,
        rewritten: parsed.rewritten,
        skills: parsed.skills_used ?? b.skills ?? [],
      });
    }
    experiences.push({ ...exp, bullets });
  }
  return { ...draft, experiences };
}

export function enhanceActionVerbs(bullet: string): string {
  const hasVerb = actionVerbs.some((v) => bullet.startsWith(v));
  if (hasVerb) return bullet;
  return `${actionVerbs[0]} ${bullet}`;
}
