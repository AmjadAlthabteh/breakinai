class JobsApp {
  constructor() {
    this.filters = {};
    this.targetElement = null;
  }

  filterJobs(jobs) {
    const q = this.filters.search.value.toLowerCase();
    const d = this.filters.domain.value;
    const l = this.filters.level.value;
    const m = this.filters.mode.value;

    return jobs.filter((job) => {
      const textMatch =
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.summary.toLowerCase().includes(q) ||
        job.stack.some((s) => s.toLowerCase().includes(q));
      const domainMatch = d ? job.domain === d : true;
      const levelMatch = l ? job.level === l : true;
      const modeMatch = m ? job.workMode === m : true;
      return textMatch && domainMatch && levelMatch && modeMatch;
    });
  }

  sortJobs(jobs, sortValue) {
    const copy = [...jobs];
    if (sortValue === SORT_OPTIONS.RECENT) {
      return copy.sort((a, b) => a.postedDays - b.postedDays);
    }
    if (sortValue === SORT_OPTIONS.COMP) {
      return copy.sort((a, b) => b.compValue - a.compValue);
    }
    return copy.sort((a, b) => b.score - a.score);
  }

  async loadJobs() {
    try {
      uiRenderer.showLoading(this.targetElement.id);
      const jobs = await api.fetchJobs();
      jobsState.setJobs(jobs);
      this.applyFilters();
    } catch (error) {
      uiRenderer.showError('Failed to load jobs. Please try again.', this.targetElement.id);
    }
  }

  applyFilters() {
    const allJobs = jobsState.getJobs();
    const filtered = this.sortJobs(
      this.filterJobs(allJobs),
      this.filters.sort.value
    );

    this.targetElement.innerHTML = uiRenderer.renderJobsList(filtered, jobsState);
    uiRenderer.updateCounts(jobsState, filtered.length);
  }

  handleJobAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const jobId = button.getAttribute("data-id");
    const action = button.getAttribute("data-action");

    if (action === JOB_ACTIONS.SAVE) {
      jobsState.toggleSaved(jobId);
    } else if (action === JOB_ACTIONS.APPLY) {
      jobsState.toggleApplied(jobId);
    }

    this.applyFilters();
  }

  async initialize(listId = "jobs-grid") {
    const search = document.getElementById("search");
    const domain = document.getElementById("domain");
    const level = document.getElementById("level");
    const mode = document.getElementById("mode");
    const sort = document.getElementById("sort");
    const target = document.getElementById(listId);

    if (!search || !domain || !level || !mode || !sort || !target) {
      console.error('Required elements not found');
      return;
    }

    this.filters = { search, domain, level, mode, sort };
    this.targetElement = target;

    [search, domain, level, mode, sort].forEach((el) => {
      el.addEventListener("input", () => this.applyFilters());
    });

    target.addEventListener("click", (e) => this.handleJobAction(e));

    jobsState.subscribe(() => this.applyFilters());

    await this.loadJobs();
  }
}

class AuthManager {
  constructor() {
    this.loginBtn = null;
    this.dialog = null;
    this.form = null;
  }

  initialize() {
    this.loginBtn = document.getElementById("loginBtn");
    this.dialog = document.getElementById("authDialog");
    this.form = document.getElementById("authForm");

    if (!this.loginBtn || !this.dialog || !this.form) {
      console.warn('Auth elements not found');
      return;
    }

    this.loginBtn.addEventListener("click", () => this.dialog.showModal());
    this.form.addEventListener("submit", (event) => this.handleLogin(event));
  }

  handleLogin(event) {
    event.preventDefault();
    this.dialog.close();
    this.loginBtn.textContent = "Signed in";
    this.loginBtn.classList.add("is-logged");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const listId = document.getElementById("jobs-grid") ? "jobs-grid" : "jobs-list";

  const app = new JobsApp();
  await app.initialize(listId);

  const auth = new AuthManager();
  auth.initialize();
});
