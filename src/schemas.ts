// Minimal schema shape to avoid external dependency; align with JSON Schema draft-07.
type JSONSchema = Record<string, unknown>;

export const UserProfileSchema: JSONSchema = {
  type: "object",
  required: ["id", "name", "work_history", "skills"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    contact: { type: "string" },
    location: { type: "string" },
    summary: { type: "string" },
    work_history: {
      type: "array",
      items: {
        type: "object",
        required: ["company", "title", "start", "bullets"],
        properties: {
          company: { type: "string" },
          title: { type: "string" },
          location: { type: "string" },
          start: { type: "string" },
          end: { type: "string" },
          bullets: {
            type: "array",
            items: {
              type: "object",
              required: ["original"],
              properties: {
                original: { type: "string" },
                rewritten: { type: "string" },
                skills: { type: "array", items: { type: "string" } },
                metrics: { type: "object", additionalProperties: true },
                style: { type: "string" },
              },
            },
          },
          tech: { type: "array", items: { type: "string" } },
          achievements: { type: "array", items: { type: "string" } },
          metrics: { type: "object", additionalProperties: true },
          domain: { type: "array", items: { type: "string" } },
          seniority: { type: "string" },
        },
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "summary", "bullets"],
        properties: {
          name: { type: "string" },
          summary: { type: "string" },
          bullets: {
            type: "array",
            items: {
              type: "object",
              required: ["original"],
              properties: {
                original: { type: "string" },
                rewritten: { type: "string" },
                skills: { type: "array", items: { type: "string" } },
                metrics: { type: "object", additionalProperties: true },
                style: { type: "string" },
              },
            },
          },
          tech: { type: "array", items: { type: "string" } },
          links: { type: "array", items: { type: "string" } },
        },
      },
    },
    skills: {
      type: "array",
      items: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          level: { type: "string" },
          years: { type: "number" },
          category: { type: "string" },
        },
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        required: ["institution", "degree"],
        properties: {
          institution: { type: "string" },
          degree: { type: "string" },
          start: { type: "string" },
          end: { type: "string" },
        },
      },
    },
    certs: {
      type: "array",
      items: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          authority: { type: "string" },
          year: { type: "number" },
        },
      },
    },
    preferences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: { type: "string" },
          location: { type: "string" },
          seniority: { type: "string" },
          domains: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

export const JobDescriptionSchema: JSONSchema = {
  type: "object",
  required: ["id", "title", "raw_text"],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    company: { type: "string" },
    location: { type: "string" },
    level: { type: "string" },
    domains: { type: "array", items: { type: "string" } },
    responsibilities: { type: "array", items: { type: "string" } },
    requirements: { type: "array", items: { type: "string" } },
    nice_to_haves: { type: "array", items: { type: "string" } },
    benefits: { type: "array", items: { type: "string" } },
    raw_text: { type: "string" },
  },
};

export const JDAnalysisSchema: JSONSchema = {
  type: "object",
  required: ["required_skills", "preferred_skills", "missing_skills", "hidden_signals", "risks", "suggested_keywords", "seniority_cues"],
  properties: {
    required_skills: { type: "array", items: { type: "string" } },
    preferred_skills: { type: "array", items: { type: "string" } },
    missing_skills: { type: "array", items: { type: "string" } },
    hidden_signals: {
      type: "array",
      items: {
        type: "object",
        required: ["type", "signal", "evidence"],
        properties: {
          type: { type: "string" },
          signal: { type: "string" },
          evidence: { type: "string" },
        },
      },
    },
    risks: { type: "array", items: { type: "string" } },
    suggested_keywords: { type: "array", items: { type: "string" } },
    seniority_cues: { type: "array", items: { type: "string" } },
  },
};

export const TailoredResumeSchema: JSONSchema = {
  type: "object",
  required: ["summary", "skills_ranked", "bullets", "ats_keywords_added", "style", "warnings"],
  properties: {
    summary: { type: "string" },
    skills_ranked: {
      type: "array",
      items: {
        type: "object",
        required: ["skill", "source", "user_has", "missing"],
        properties: {
          skill: { type: "string" },
          source: { type: "string" },
          user_has: { type: "boolean" },
          missing: { type: "boolean" },
          evidence: { type: "string" },
        },
      },
    },
    bullets: {
      type: "array",
      items: {
        type: "object",
        required: ["original"],
        properties: {
          original: { type: "string" },
          rewritten: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          metrics: { type: "object", additionalProperties: true },
          style: { type: "string" },
        },
      },
    },
    ats_keywords_added: { type: "array", items: { type: "string" } },
    style: { type: "string" },
    warnings: { type: "array", items: { type: "string" } },
  },
};

export const GapAnalysisSchema: JSONSchema = {
  type: "object",
  required: ["missing_experience", "micro_projects", "filler_bullets_suggestions"],
  properties: {
    missing_experience: {
      type: "array",
      items: {
        type: "object",
        required: ["area", "example_tasks", "proof_ideas"],
        properties: {
          area: { type: "string" },
          example_tasks: { type: "array", items: { type: "string" } },
          proof_ideas: { type: "array", items: { type: "string" } },
        },
      },
    },
    micro_projects: {
      type: "array",
      items: {
        type: "object",
        required: ["title", "goal", "steps", "deliverables"],
        properties: {
          title: { type: "string" },
          goal: { type: "string" },
          steps: { type: "array", items: { type: "string" } },
          deliverables: { type: "array", items: { type: "string" } },
        },
      },
    },
    filler_bullets_suggestions: {
      type: "array",
      items: {
        type: "object",
        required: ["original"],
        properties: {
          original: { type: "string" },
          rewritten: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          metrics: { type: "object", additionalProperties: true },
          style: { type: "string" },
        },
      },
    },
  },
};

export const MatchScoreSchema: JSONSchema = {
  type: "object",
  required: ["score_0_100", "rationale", "strengths", "gaps", "keyword_coverage", "seniority_alignment", "domain_alignment"],
  properties: {
    score_0_100: { type: "number" },
    rationale: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" } },
    gaps: { type: "array", items: { type: "string" } },
    keyword_coverage: { type: "number" },
    seniority_alignment: { type: "number" },
    domain_alignment: { type: "number" },
  },
};
