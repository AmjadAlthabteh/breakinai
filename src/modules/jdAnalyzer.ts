import { JDAnalysis, JobDescription } from "../types";
import { LLMClient, LLMMessage, systemGuardrails } from "../llm";

const jdAnalyzerPrompt = (jd: JobDescription, resumeSkills: string[]) => `
You are an expert resume-to-job-description analyzer and career advisor. Your goal is to provide deep, actionable insights for optimizing a resume to match this specific job posting.

Analyze the following job posting comprehensively and extract:

1. **required_skills**: Hard technical and non-technical requirements explicitly mentioned in the JD (e.g., "Python", "5+ years experience", "Bachelor's degree"). Be thorough.

2. **preferred_skills**: Nice-to-have qualifications, bonus skills, or "preferred" requirements that would strengthen the application.

3. **missing_skills**: Skills from required_skills that are NOT present in the candidate's current resume skills. This is critical for identifying gaps.

4. **hidden_signals**:
   - ATS keywords and phrases commonly used in this industry
   - Seniority/level indicators (junior, senior, lead, staff, principal)
   - Domain-specific terminology and buzzwords
   - Cultural fit signals (team player, fast-paced, autonomous)
   - Format preferences or writing style hints

5. **risks**: Potential blockers or red flags:
   - Work authorization requirements
   - Security clearance needs
   - Required certifications
   - Travel requirements (% or days/month)
   - On-call/weekend work expectations
   - Location restrictions (must be in specific timezone, city, etc.)

6. **suggested_keywords**: Synonyms, alternative phrasings, and industry variants of the required skills. For example:
   - "JavaScript" → ["JS", "ES6", "TypeScript", "Node.js", "React", "Frontend"]
   - "Machine Learning" → ["ML", "AI", "Deep Learning", "Neural Networks", "TensorFlow"]

7. **seniority_cues**: Specific words/phrases indicating the expected level (e.g., "lead team", "mentor", "architect", "entry-level", "4+ years").

**Job Details:**
- Title: ${jd.title}
- Company: ${jd.company ?? "unknown"}
- Job Description:
${jd.raw_text}

**Candidate's Current Resume Skills:**
${resumeSkills.join(", ")}

**Important:** Return ONLY valid JSON with these exact keys: required_skills, preferred_skills, missing_skills, hidden_signals, risks, suggested_keywords, seniority_cues. No markdown, no explanation text.`;

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
