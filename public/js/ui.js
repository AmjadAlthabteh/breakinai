class UIRenderer {
  formatPosted(days) {
    if (days === 0) return "Posted today";
    if (days === 1) return "Posted 1 day ago";
    return `Posted ${days} days ago`;
  }

  renderJobCard(job, isSaved, isApplied) {
    const workModeLabel = WORK_MODE_LABELS[job.workMode] || job.workMode;

    return `
      <article class="job-card" aria-label="${job.title} at ${job.company}">
        <div class="job-meta--top">
          <span class="pill" data-tone="${job.domain}">${job.company}</span>
          <span class="pill pill--inline" data-tone="${job.domain}">${job.domainLabel}</span>
          <span class="chip">${workModeLabel}</span>
          <span class="chip">${job.employmentType}</span>
          <span class="chip">${this.formatPosted(job.postedDays)}</span>
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
            <button class="action-btn is-ghost" data-action="${JOB_ACTIONS.SAVE}" data-id="${job.id}">${isSaved ? "Saved" : "Save role"}</button>
            <button class="action-btn is-primary" data-action="${JOB_ACTIONS.APPLY}" data-id="${job.id}">${isApplied ? "Unmark" : "Mark applied"}</button>
          </div>
        </div>
      </article>
    `;
  }

  renderJobsList(jobs, state) {
    if (!jobs || jobs.length === 0) {
      return "<p class='muted'>No jobs match yet.</p>";
    }

    return jobs
      .map(job => this.renderJobCard(
        job,
        state.isSaved(job.id),
        state.isApplied(job.id)
      ))
      .join("");
  }

  updateCounts(state, filteredCount) {
    this.setText("discoverCount", state.getJobs().length.toString());
    this.setText("savedCount", state.getSavedCount().toString());
    this.setText("appliedCount", state.getAppliedCount().toString());
    this.setText("hotCount", state.getHotJobsCount().toString());
    this.setText("resultsCount", `Showing ${filteredCount} roles`);
    this.setText("statusSaved", `Saved: ${state.getSavedCount()}`);
    this.setText("statusApplied", `Applied: ${state.getAppliedCount()}`);
  }

  setText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }

  showError(message, containerId = null) {
    const errorHtml = `
      <div class="error-message" role="alert">
        <strong>Error:</strong> ${message}
      </div>
    `;

    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = errorHtml;
      }
    } else {
      console.error(message);
    }
  }

  showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="loading-message">
          <p>Loading jobs...</p>
        </div>
      `;
    }
  }
}

if (typeof window !== 'undefined') {
  window.UIRenderer = UIRenderer;
  window.uiRenderer = new UIRenderer();
}
