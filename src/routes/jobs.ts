import { Router, Request, Response } from 'express';

export const jobsRouter = Router();

type Job = {
  id: string;
  title: string;
  company: string;
  domain: string;
  domainLabel: string;
  level: string;
  location: string;
  employmentType: string;
  workMode: string;
  salary: string;
  compValue: number;
  stack: string[];
  summary: string;
  score: number;
  postedDays: number;
  hot: boolean;
};

const jobs: Job[] = [
  {
    id: "launchpad-backend",
    title: "Backend Intern",
    company: "LaunchPad",
    domain: "startup",
    domainLabel: "Startups",
    level: "intern",
    location: "Remote",
    employmentType: "Internship",
    workMode: "remote",
    salary: "$2k/mo stipend",
    compValue: 24,
    stack: ["Node", "React", "Figma"],
    summary: "Ship small APIs that power student career journeys and co-design flows with PM/Design.",
    score: 84,
    postedDays: 3,
    hot: true,
  },
  {
    id: "spark-product-intern",
    title: "Product Intern",
    company: "Spark",
    domain: "consumer",
    domainLabel: "Consumer",
    level: "intern",
    location: "NYC",
    employmentType: "Hybrid",
    workMode: "hybrid",
    salary: "$3k/mo stipend",
    compValue: 36,
    stack: ["Figma", "User research", "Notion"],
    summary: "Map onboarding funnels, shadow user calls, and deliver quick A/B experiments with design.",
    score: 79,
    postedDays: 5,
    hot: false,
  },
  {
    id: "campushub-frontend",
    title: "Junior Frontend Engineer",
    company: "CampusHub",
    domain: "startup",
    domainLabel: "Startups",
    level: "junior",
    location: "Remote",
    employmentType: "Full-time",
    workMode: "remote",
    salary: "$85k-$105k",
    compValue: 105,
    stack: ["React", "TypeScript", "Tailwind"],
    summary: "Own student-facing UI, improve accessibility, and tune performance for dashboards.",
    score: 86,
    postedDays: 9,
    hot: true,
  },
  {
    id: "bankco-backend",
    title: "Senior Backend Engineer",
    company: "BankCo",
    domain: "fintech",
    domainLabel: "Fintech",
    level: "senior",
    location: "Remote",
    employmentType: "Full-time",
    workMode: "remote",
    salary: "$160k-$190k",
    compValue: 190,
    stack: ["Go", "Kubernetes", "Postgres"],
    summary: "Scale payments services, harden observability, and lead incident drills with SRE.",
    score: 82,
    postedDays: 4,
    hot: false,
  },
  {
    id: "novaai-lead",
    title: "Lead ML Engineer, GenAI Safety",
    company: "NovaAI",
    domain: "ml",
    domainLabel: "AI / ML",
    level: "lead",
    location: "NYC / Remote",
    employmentType: "Hybrid",
    workMode: "hybrid",
    salary: "$200k-$240k",
    compValue: 240,
    stack: ["Python", "Triton", "LLM evals"],
    summary: "Stand up eval pipelines, build safety classifiers, and partner with research on alignment.",
    score: 92,
    postedDays: 2,
    hot: true,
  },
  {
    id: "medloop-ux",
    title: "Product Designer (Health)",
    company: "MedLoop",
    domain: "health",
    domainLabel: "Health",
    level: "junior",
    location: "SF",
    employmentType: "On-site",
    workMode: "onsite",
    salary: "$115k-$130k",
    compValue: 130,
    stack: ["Figma", "Design systems", "Prototyping"],
    summary: "Redesign care journeys, prototype clinician tools, and align design tokens with eng.",
    score: 81,
    postedDays: 6,
    hot: false,
  },
  {
    id: "grid-ops",
    title: "Infrastructure Engineer",
    company: "GridLayer",
    domain: "infra",
    domainLabel: "Infrastructure",
    level: "senior",
    location: "Remote (US)",
    employmentType: "Full-time",
    workMode: "remote",
    salary: "$175k-$205k",
    compValue: 205,
    stack: ["Terraform", "AWS", "Rust"],
    summary: "Own infra-as-code, ship safe migrations, and codify platform guardrails for teams.",
    score: 88,
    postedDays: 7,
    hot: false,
  },
  {
    id: "atlas-analyst",
    title: "Data Analyst, Growth",
    company: "Atlas Labs",
    domain: "consumer",
    domainLabel: "Consumer",
    level: "junior",
    location: "Remote / EU",
    employmentType: "Full-time",
    workMode: "remote",
    salary: "$110k-$125k",
    compValue: 125,
    stack: ["SQL", "dbt", "Looker"],
    summary: "Model funnels, publish weekly dashboards, and spot the experiments that move activation.",
    score: 83,
    postedDays: 1,
    hot: true,
  },
];

jobsRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: jobs
  });
});

jobsRouter.get('/:id', (req: Request, res: Response) => {
  const job = jobs.find(j => j.id === req.params.id);

  if (!job) {
    res.status(404).json({
      error: 'Job not found'
    });
    return;
  }

  res.json({
    success: true,
    data: job
  });
});

jobsRouter.post('/search', (req: Request, res: Response) => {
  const { query, domain, level, workMode } = req.body;

  let filtered = jobs;

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(job =>
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.summary.toLowerCase().includes(q) ||
      job.stack.some(s => s.toLowerCase().includes(q))
    );
  }

  if (domain) {
    filtered = filtered.filter(job => job.domain === domain);
  }

  if (level) {
    filtered = filtered.filter(job => job.level === level);
  }

  if (workMode) {
    filtered = filtered.filter(job => job.workMode === workMode);
  }

  res.json({
    success: true,
    data: filtered
  });
});
