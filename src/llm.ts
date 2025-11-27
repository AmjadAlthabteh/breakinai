export type LLMConfig = {
  model: string;
  temperature?: number;
  max_tokens?: number;
};

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMResponse = {
  text: string;
  raw?: unknown;
};

export interface LLMClient {
  complete(messages: LLMMessage[], config?: LLMConfig): Promise<LLMResponse>;
}

// This placeholder client keeps the project dependency-free.
export class NoopLLM implements LLMClient {
  async complete(messages: LLMMessage[]): Promise<LLMResponse> {
    return { text: "[LLM call would go here. Provided messages length: " + messages.length + "]" };
  }
}

export const systemGuardrails = `
- Do not fabricate employment, dates, education, or certifications.
- Preserve truthfulness; only use skills that appear in the provided resume/profile.
- Keep output ATS-safe: plain text, no tables or graphics, no emojis.
- Keep bullets under 30 words, start with strong action verbs, include metrics when present.
- Avoid demographic or personal data not supplied by the user.
- Do not claim clearance/eligibility unless explicitly provided.`;
