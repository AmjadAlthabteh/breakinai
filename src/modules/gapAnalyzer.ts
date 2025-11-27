import { GapAnalysis, JDAnalysis, MicroProject } from "../types";

const projectTemplate = (skill: string): MicroProject => ({
  title: `Build a ${skill} mini-project`,
  goal: `Demonstrate proficiency with ${skill}`,
  steps: [
    `Design a small scope where ${skill} is central`,
    `Implement with clear README and tests`,
    `Add metrics (latency, accuracy, cost)`,
    `Publish code and short writeup`,
  ],
  deliverables: ["Git repo link", "Short blog/README", "Demo screenshot or CLI output"],
});

export function gapAnalyze(jd: JDAnalysis): GapAnalysis {
  const missing_experience = jd.missing_skills.map((skill) => ({
    area: skill,
    example_tasks: [`Ship a feature using ${skill}`, `Pair with a peer to review ${skill} usage`],
    proof_ideas: [`Open-source snippet using ${skill}`, `Write retrospective on learning ${skill}`],
  }));

  const micro_projects = jd.missing_skills.slice(0, 3).map(projectTemplate);

  const filler_bullets_suggestions = jd.missing_skills.map((skill) => ({
    original: "",
    rewritten: `Prototyped a small ${skill} demo to validate feasibility and documented learnings.`,
    skills: [skill],
    metrics: {},
  }));

  return { missing_experience, micro_projects, filler_bullets_suggestions };
}
