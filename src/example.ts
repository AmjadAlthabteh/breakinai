import { orchestrate } from "./orchestrator";
import { UserProfile, JobDescription } from "./types";
import { NoopLLM } from "./llm";

const profile: UserProfile = {
  id: "user-123",
  name: "Pat Engineer",
  contact: "pat@example.com",
  location: "Remote",
  summary: "Backend engineer focused on APIs and reliability.",
  work_history: [
    {
      company: "Acme",
      title: "Senior Backend Engineer",
      start: "2020-01",
      bullets: [
        { original: "Built API services in Go and improved latency by 20%." },
        { original: "Led migration to Kubernetes and improved deploy speed." },
      ],
    },
  ],
  projects: [
    {
      name: "Fintech Service",
      summary: "Payments microservice",
      bullets: [{ original: "Implemented payment retries and idempotency." }],
      tech: ["Go", "Postgres", "Kubernetes"],
    },
  ],
  skills: [
    { name: "Go", years: 4 },
    { name: "Kubernetes", years: 3 },
    { name: "Postgres", years: 5 },
  ],
};

const jd: JobDescription = {
  id: "jd-1",
  title: "Senior Backend Engineer, Fintech",
  company: "BankCo",
  raw_text: `
We need a Senior Backend Engineer with Go, Kubernetes, and Postgres experience.
Nice to have: SOC2, Terraform. Must mentor juniors and work in fintech.
`,
};

async function run() {
  const result = await orchestrate(profile, jd, { style: "executive", llm: new NoopLLM() });
  console.log(JSON.stringify(result, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
