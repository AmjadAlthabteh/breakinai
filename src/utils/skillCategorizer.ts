import { Skill, SkillCategory } from "../types";

// Skill categorization databases
const TECHNICAL_SKILLS = new Set([
  "algorithm", "data structures", "system design", "api design", "database design",
  "microservices", "distributed systems", "cloud architecture", "devops", "ci/cd",
  "testing", "debugging", "performance optimization", "security", "scalability"
]);

const PROGRAMMING_LANGUAGES = new Set([
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby",
  "php", "swift", "kotlin", "scala", "r", "matlab", "sql", "html", "css"
]);

const FRAMEWORKS = new Set([
  "react", "angular", "vue", "svelte", "next.js", "nuxt", "express", "fastapi",
  "django", "flask", "spring", "spring boot", ".net", "rails", "laravel",
  "tailwind", "bootstrap", "material-ui", "chakra ui"
]);

const TOOLS = new Set([
  "git", "github", "gitlab", "bitbucket", "docker", "kubernetes", "jenkins",
  "circleci", "travis ci", "aws", "azure", "gcp", "terraform", "ansible",
  "jira", "confluence", "slack", "figma", "postman", "webpack", "vite",
  "vs code", "intellij", "eclipse", "vim", "emacs"
]);

const SOFT_SKILLS = new Set([
  "leadership", "communication", "teamwork", "problem solving", "critical thinking",
  "collaboration", "mentoring", "project management", "agile", "scrum",
  "stakeholder management", "presentation", "documentation", "time management",
  "adaptability", "creativity", "decision making", "conflict resolution"
]);

/**
 * Automatically categorize a skill based on its name
 */
export function categorizeSkill(skillName: string): SkillCategory {
  const normalized = skillName.toLowerCase().trim();

  if (SOFT_SKILLS.has(normalized)) return "soft";
  if (PROGRAMMING_LANGUAGES.has(normalized)) return "languages";
  if (FRAMEWORKS.has(normalized)) return "frameworks";
  if (TOOLS.has(normalized)) return "tools";
  if (TECHNICAL_SKILLS.has(normalized)) return "technical";

  // Pattern matching for uncategorized skills
  if (/(js|script|lang|language)$/i.test(skillName)) return "languages";
  if (/(framework|lib|library)$/i.test(skillName)) return "frameworks";
  if (/(tool|software|platform|service)$/i.test(skillName)) return "tools";
  if (/(soft skill|people|team|manage)$/i.test(skillName)) return "soft";

  return "other";
}

/**
 * Enhance a skill object with automatic categorization
 */
export function enhanceSkill(skill: Skill): Skill {
  if (!skill.category) {
    skill.category = categorizeSkill(skill.name);
  }
  return skill;
}

/**
 * Group skills by category
 */
export function groupSkillsByCategory(skills: Skill[]): Record<SkillCategory, Skill[]> {
  const grouped: Record<SkillCategory, Skill[]> = {
    technical: [],
    soft: [],
    tools: [],
    languages: [],
    frameworks: [],
    other: []
  };

  skills.forEach(skill => {
    const enhanced = enhanceSkill(skill);
    const category = enhanced.category || "other";
    grouped[category].push(enhanced);
  });

  return grouped;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: SkillCategory): string {
  const names: Record<SkillCategory, string> = {
    technical: "Technical Skills",
    soft: "Soft Skills",
    tools: "Tools & Platforms",
    languages: "Programming Languages",
    frameworks: "Frameworks & Libraries",
    other: "Other Skills"
  };
  return names[category];
}
