const WORK_MODE_LABELS = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const DOMAIN_LABELS = {
  fintech: "Fintech",
  ml: "AI / ML",
  health: "Health",
  infra: "Infrastructure",
  consumer: "Consumer",
  startup: "Startups",
};

const LEVEL_LABELS = {
  intern: "Internship",
  junior: "Junior",
  senior: "Senior",
  lead: "Lead",
};

const SORT_OPTIONS = {
  MATCH: 'match',
  RECENT: 'recent',
  COMP: 'comp',
};

const JOB_ACTIONS = {
  SAVE: 'save',
  APPLY: 'apply',
};

if (typeof window !== 'undefined') {
  window.WORK_MODE_LABELS = WORK_MODE_LABELS;
  window.DOMAIN_LABELS = DOMAIN_LABELS;
  window.LEVEL_LABELS = LEVEL_LABELS;
  window.SORT_OPTIONS = SORT_OPTIONS;
  window.JOB_ACTIONS = JOB_ACTIONS;
}
