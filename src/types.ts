export type SkillCategory = "technical" | "soft" | "tools" | "languages" | "frameworks" | "other";

export type Skill = {
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  years?: number;
  category?: SkillCategory;
};

export type Bullet = {
  original: string;
  rewritten?: string;
  skills?: string[];
  metrics?: Record<string, number | string>;
  style?: "concise" | "executive" | "technical";
};

export type Experience = {
  company: string;
  title: string;
  location?: string;
  start: string;
  end?: string;
  bullets: Bullet[];
  tech?: string[];
  achievements?: string[];
  metrics?: Record<string, number | string>;
  domain?: string[];
  seniority?: string;
};

export type Project = {
  name: string;
  summary: string;
  bullets: Bullet[];
  tech?: string[];
  links?: string[];
};

export type Education = {
  institution: string;
  degree: string;
  start?: string;
  end?: string;
};

export type Certification = {
  name: string;
  authority?: string;
  year?: number;
};

export type Preference = {
  role?: string;
  location?: string;
  seniority?: string;
  domains?: string[];
};

export type UserProfile = {
  id: string;
  name: string;
  contact?: string;
  location?: string;
  summary?: string;
  work_history: Experience[];
  projects?: Project[];
  skills: Skill[];
  education?: Education[];
  certs?: Certification[];
  preferences?: Preference[];
};

export type JobDescription = {
  id: string;
  title: string;
  company?: string;
  location?: string;
  level?: string;
  domains?: string[];
  responsibilities?: string[];
  requirements?: string[];
  nice_to_haves?: string[];
  benefits?: string[];
  raw_text: string;
};

export type HiddenSignal = {
  type: "ats_tag" | "seniority" | "domain" | "tone" | "format";
  signal: string;
  evidence: string;
};

export type JDAnalysis = {
  required_skills: string[];
  preferred_skills: string[];
  missing_skills: string[];
  hidden_signals: HiddenSignal[];
  risks: string[];
  suggested_keywords: string[];
  seniority_cues: string[];
};

export type ResumeDraft = {
  summary: string;
  skills: string[];
  experiences: Experience[];
  projects?: Project[];
  education?: Education[];
  extras?: string[];
  warnings?: string[];
};

export type RankedSkill = {
  skill: string;
  source: "work_history" | "project" | "education" | "other";
  user_has: boolean;
  missing: boolean;
  evidence?: string;
};

export type TailoredResume = {
  summary: string;
  skills_ranked: RankedSkill[];
  bullets: Bullet[];
  ats_keywords_added: string[];
  style: "concise" | "executive" | "technical";
  warnings: string[];
};

export type GapItem = {
  area: string;
  example_tasks: string[];
  proof_ideas: string[];
};

export type MicroProject = {
  title: string;
  goal: string;
  steps: string[];
  deliverables: string[];
};

export type GapAnalysis = {
  missing_experience: GapItem[];
  micro_projects: MicroProject[];
  filler_bullets_suggestions: Bullet[];
};

export type MatchScore = {
  score_0_100: number;
  rationale: string[];
  strengths: string[];
  gaps: string[];
  keyword_coverage: number;
  seniority_alignment: number;
  domain_alignment: number;
};

export type PipelineResult = {
  tailored: TailoredResume;
  gaps: GapAnalysis;
  score: MatchScore;
  analysis: JDAnalysis;
};
