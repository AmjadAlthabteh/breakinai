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
You are an expert resume writer specializing in the CAR (Context-Action-Result) framework and ATS optimization.

Rewrite this resume bullet point using the CAR framework:
- **Context**: What was the situation or challenge? (briefly)
- **Action**: What specific actions did you take? (use strong action verbs)
- **Result**: What measurable outcomes did you achieve? (quantify when possible)

**Strict Rules:**
1. Start with a powerful action verb (Led, Built, Shipped, Reduced, Accelerated, Designed, etc.)
2. Keep it under 25 words for maximum impact
3. Preserve ALL metrics and numbers from the original (%, $, time saved, users, etc.)
4. Make it ATS-friendly (use industry-standard keywords)
5. DO NOT fabricate or exaggerate - only enhance clarity and impact
6. Use active voice and past tense
7. Remove vague words like "helped," "assisted," "worked on" - be direct and assertive
8. Quantify results wherever possible (even estimates like "improved by ~30%")

**Original bullet point:**
"${bullet.original}"

**Output Format:**
Return ONLY valid JSON with this structure:
{
  "rewritten": "Your improved bullet point here",
  "skills_used": ["skill1", "skill2", "skill3"]
}

The "skills_used" array should list technical skills, tools, or technologies explicitly mentioned or strongly implied in the bullet point.`;

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
