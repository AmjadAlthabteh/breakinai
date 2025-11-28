const API_URL = 'http://localhost:3001/api';

let latestJobs = [];

async function fetchJobs() {
  try {
    const response = await fetch(`${API_URL}/jobs`);
    const result = await response.json();
    if (result.success) {
      latestJobs = result.data;
      return result.data;
    }
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return [];
  }
}

async function optimizeResume(profile, jobDescription, style = 'concise') {
  try {
    const response = await fetch(`${API_URL}/resume/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile, jobDescription, style }),
    });
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || 'Failed to optimize resume');
  } catch (error) {
    console.error('Failed to optimize resume:', error);
    throw error;
  }
}

async function analyzeJobDescription(jobDescription, userSkills = []) {
  try {
    const response = await fetch(`${API_URL}/resume/analyze-jd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobDescription, userSkills }),
    });
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || 'Failed to analyze job description');
  } catch (error) {
    console.error('Failed to analyze job description:', error);
    throw error;
  }
}

async function scoreMatch(resume, analysis) {
  try {
    const response = await fetch(`${API_URL}/resume/score-match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resume, analysis }),
    });
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || 'Failed to score match');
  } catch (error) {
    console.error('Failed to score match:', error);
    throw error;
  }
}

const workModeLabels = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const state = {
  saved: loadSet("lp_saved"),
  applied: loadSet("lp_applied"),
};

function loadSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (_) {
    return new Set();
  }
}

function persistSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (_) {
    /* ignore persistence errors */
  }
}

function formatPosted(days) {
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  return `Posted ${days} days ago`;
}

function renderJobCard(job, saved, applied) {
  const isSaved = saved.has(job.id);
  const isApplied = applied.has(job.id);
  return `
    <article class="job-card" aria-label="${job.title} at ${job.company}">
      <div class="job-meta--top">
        <span class="pill" data-tone="${job.domain}">${job.company}</span>
        <span class="pill pill--inline" data-tone="${job.domain}">${job.domainLabel}</span>
        <span class="chip">${workModeLabels[job.workMode] || job.workMode}</span>
        <span class="chip">${job.employmentType}</span>
        <span class="chip">${formatPosted(job.postedDays)}</span>
        ${job.hot ? `<span class="chip" data-tone="consumer">Hot lead</span>` : ""}
      </div>
      <h3 class="job-title">${job.title} <small>${job.location}</small></h3>
      <div class="job-meta">
        <span class="chip" data-tone="${job.domain}">${job.domainLabel}</span>
        <span class="chip">${job.level}</span>
        ${job.stack.map((s) => `<span class="chip" data-tone="${job.domain}">${s}</span>`).join("")}
      </div>
      <p class="job-summary">${job.summary}</p>
      <div class="job-footer">
        <div class="job-meta">
          <span class="salary">${job.salary}</span>
          <span class="match" data-state="${isApplied ? "applied" : "default"}">${isApplied ? "Applied" : `Match ${job.score}`}</span>
        </div>
        <div class="actions">
          <button class="action-btn is-ghost" data-action="save" data-id="${job.id}">${isSaved ? "Saved" : "Save role"}</button>
          <button class="action-btn is-primary" data-action="apply" data-id="${job.id}">${isApplied ? "Unmark" : "Mark applied"}</button>
        </div>
      </div>
    </article>
  `;
}

function filterJobs(jobs, filters) {
  const q = filters.search.value.toLowerCase();
  const d = filters.domain.value;
  const l = filters.level.value;
  const m = filters.mode.value;

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

function sortJobs(jobs, sortValue) {
  const copy = [...jobs];
  if (sortValue === "recent") {
    return copy.sort((a, b) => a.postedDays - b.postedDays);
  }
  if (sortValue === "comp") {
    return copy.sort((a, b) => b.compValue - a.compValue);
  }
  return copy.sort((a, b) => b.score - a.score);
}

function updateCounts(filteredCount) {
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText("discoverCount", latestJobs.length.toString());
  setText("savedCount", state.saved.size.toString());
  setText("appliedCount", state.applied.size.toString());
  setText("hotCount", latestJobs.filter((job) => job.hot).length.toString());
  setText("resultsCount", `Showing ${filteredCount} roles`);
  setText("statusSaved", `Saved: ${state.saved.size}`);
  setText("statusApplied", `Applied: ${state.applied.size}`);
}

async function mountBoard(listId = "jobs-grid") {
  const search = document.getElementById("search");
  const domain = document.getElementById("domain");
  const level = document.getElementById("level");
  const mode = document.getElementById("mode");
  const sort = document.getElementById("sort");
  const target = document.getElementById(listId);
  if (!search || !domain || !level || !mode || !sort || !target) return;

  const filters = { search, domain, level, mode, sort };

  await fetchJobs();

  const applyFilters = () => {
    const filtered = sortJobs(filterJobs(latestJobs, filters), sort.value);
    target.innerHTML = filtered.map((job) => renderJobCard(job, state.saved, state.applied)).join("") || "<p class='muted'>No jobs match yet.</p>";
    updateCounts(filtered.length);
  };

  [search, domain, level, mode, sort].forEach((el) => el.addEventListener("input", applyFilters));

  target.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const jobId = button.getAttribute("data-id");
    const action = button.getAttribute("data-action");
    if (action === "save") {
      state.saved.has(jobId) ? state.saved.delete(jobId) : state.saved.add(jobId);
      persistSet("lp_saved", state.saved);
    }
    if (action === "apply") {
      state.applied.has(jobId) ? state.applied.delete(jobId) : state.applied.add(jobId);
      persistSet("lp_applied", state.applied);
    }
    applyFilters();
  });

  applyFilters();
}

function initAuth() {
  const loginBtn = document.getElementById("loginBtn");
  const dialog = document.getElementById("authDialog");
  const form = document.getElementById("authForm");
  if (!loginBtn || !dialog || !form) return;

  loginBtn.addEventListener("click", () => dialog.showModal());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    dialog.close();
    loginBtn.textContent = "Signed in";
    loginBtn.classList.add("is-logged");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const listId = document.getElementById("jobs-grid") ? "jobs-grid" : "jobs-list";
  mountBoard(listId);
  initAuth();
});
