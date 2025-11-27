import { ResumeDraft, UserProfile } from "../types";

const defaultSummary = (profile: UserProfile): string => {
  const title = profile.preferences?.[0]?.role ?? profile.work_history[0]?.title ?? "Professional";
  const years =
    profile.skills
      .map((s) => s.years ?? 0)
      .filter((n) => n > 0)
      .reduce((a, b) => a + b, 0) || undefined;
  const topSkills = profile.skills.slice(0, 5).map((s) => s.name).join(", ");
  const yearsText = years ? `${years}+ years` : "multi-year";
  return `${title} with ${yearsText} across ${topSkills}. Focused on shipping reliable outcomes with measurable impact.`;
};

export function generateDraft(profile: UserProfile): ResumeDraft {
  const summary = profile.summary ?? defaultSummary(profile);
  const skills = profile.skills.map((s) => s.name);
  const experiences = profile.work_history;
  return {
    summary,
    skills,
    experiences,
    projects: profile.projects,
    education: profile.education,
    extras: [],
    warnings: [],
  };
}
