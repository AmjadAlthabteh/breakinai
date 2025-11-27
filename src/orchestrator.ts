import { JDAnalysis, JobDescription, PipelineResult, ResumeDraft, TailoredResume, UserProfile } from "./types";
import { analyzeJD } from "./modules/jdAnalyzer";
import { generateDraft } from "./modules/resumeGenerator";
import { rewriteBulletsCAR } from "./modules/bulletRewriter";
import { atsOptimize } from "./modules/atsOptimizer";
import { normalizeTone, ToneStyle } from "./modules/toneNormalizer";
import { tailorResume } from "./modules/tailoring";
import { gapAnalyze } from "./modules/gapAnalyzer";
import { scoreMatch } from "./modules/matchScorer";
import { LLMClient, NoopLLM } from "./llm";

export type OrchestratorConfig = {
  style?: ToneStyle;
  llm?: LLMClient;
};

export async function orchestrate(profile: UserProfile, jd: JobDescription, cfg: OrchestratorConfig = {}): Promise<PipelineResult> {
  const llm = cfg.llm ?? new NoopLLM();
  const style = cfg.style ?? "concise";

  const draft: ResumeDraft = generateDraft(profile);
  const analysis: JDAnalysis = await analyzeJD(jd, draft.skills, llm);
  const rewritten = await rewriteBulletsCAR(draft, llm);
  const toned = normalizeTone(rewritten, style);
  const atsOptimized = atsOptimize(toned, analysis);
  const tailored: TailoredResume = tailorResume(atsOptimized, analysis, style);
  const gaps = gapAnalyze(analysis);
  const score = scoreMatch(tailored, analysis);

  return { tailored, gaps, score, analysis };
}
