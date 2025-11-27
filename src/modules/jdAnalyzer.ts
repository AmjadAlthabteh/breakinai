import { JDAnalysis, JobDescription } from "../types";
import { LLMClient, LLMMessage, systemGuardrails } from "../llm";

const jdAnalyzerPrompt = (jd: JobDescription, resumeSkills: string[]) => `
You are a resume-to-JD analyzer. Extract:
- required_skills: hard requirements from JD text.
- preferred_skills: nice to haves.
- missing_skills: required that are absent from resume skills.
- hidden_signals: ATS tags, seniority cues, domain hints, tone/format requests.
- risks: blockers or compliance notes (work auth, clearance, travel, on-call).
- suggested_keywords: synonyms/variants of required skills.
- seniority_cues: words indicating level/leadership.

JD title: ${jd.title}
Company: ${jd.company ?? "unknown"}
Raw JD:
${jd.raw_text}

Resume skills: ${resumeSkills.join(", ")}
Return JSON only.`;

export async function analyzeJD(
  jd: JobDescription,
  resumeSkills: string[],
  llm: LLMClient
): Promise<JDAnalysis> {
  const messages: LLMMessage[] = [
    { role: "system", content: systemGuardrails },
    { role: "user", content: jdAnalyzerPrompt(jd, resumeSkills) },
  ];
  const res = await llm.complete(messages, { model: "gpt-4o-mini", temperature: 0 });
  try {
    return JSON.parse(res.text) as JDAnalysis;
  } catch (err) {
    throw new Error("JD analysis parse failed: " + (err as Error).message + " | text: " + res.text);
  }
}
