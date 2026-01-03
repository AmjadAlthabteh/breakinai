class UIRenderer {
  formatPosted(days) {
    if (days === 0) return "Posted today";
    if (days === 1) return "Posted 1 day ago";
    return `Posted ${days} days ago`;
  }

  getMatchQuality(score) {
    const numScore = parseInt(score.replace('%', ''));
    if (numScore >= 90) return { label: 'Excellent', color: 'success', icon: '🎯' };
    if (numScore >= 75) return { label: 'Great', color: 'good', icon: '✨' };
    if (numScore >= 60) return { label: 'Good', color: 'decent', icon: '👍' };
    return { label: 'Fair', color: 'fair', icon: '📊' };
  }

  renderJobCard(job, isSaved, isApplied) {
    const workModeLabel = WORK_MODE_LABELS[job.workMode] || job.workMode;
    const matchQuality = this.getMatchQuality(job.score);

    return `
      <article class="job-card ${isSaved ? 'is-saved' : ''} ${isApplied ? 'is-applied' : ''}" aria-label="${job.title} at ${job.company}">
        <div class="job-card__header">
          <div class="job-meta--top">
            <span class="pill" data-tone="${job.domain}">${job.company}</span>
            <span class="pill pill--inline" data-tone="${job.domain}">${job.domainLabel}</span>
            ${job.hot ? `<span class="chip chip--hot" data-tone="consumer">🔥 Hot</span>` : ""}
          </div>
          <div class="match-badge match-badge--${matchQuality.color}" title="Match quality: ${matchQuality.label}">
            <span class="match-badge__icon">${matchQuality.icon}</span>
            <span class="match-badge__score">${job.score}</span>
            <span class="match-badge__label">${matchQuality.label}</span>
          </div>
        </div>

        <h3 class="job-title">${job.title} <small>${job.location}</small></h3>

        <div class="job-meta">
          <span class="chip chip--work-mode">${workModeLabel}</span>
          <span class="chip chip--level" data-tone="${job.domain}">${job.level}</span>
          <span class="chip chip--time">${this.formatPosted(job.postedDays)}</span>
          ${job.stack.slice(0, 3).map((s) => `<span class="chip chip--tech" data-tone="${job.domain}">${s}</span>`).join("")}
          ${job.stack.length > 3 ? `<span class="chip chip--more">+${job.stack.length - 3} more</span>` : ""}
        </div>

        <p class="job-summary">${job.summary}</p>

        <div class="job-footer">
          <div class="job-salary-info">
            <span class="salary-label">💰 Salary</span>
            <span class="salary-amount">${job.salary}</span>
          </div>
          <div class="actions actions--quick">
            <button class="action-btn action-btn--icon ${isSaved ? 'is-active' : ''}"
                    data-action="${JOB_ACTIONS.SAVE}"
                    data-id="${job.id}"
                    title="${isSaved ? 'Unsave job' : 'Save job'}">
              ${isSaved ? '★' : '☆'}
            </button>
            <button class="action-btn ${isApplied ? 'is-primary is-applied' : 'is-primary'}"
                    data-action="${JOB_ACTIONS.APPLY}"
                    data-id="${job.id}">
              ${isApplied ? '✓ Applied' : 'Mark Applied'}
            </button>
            <button class="action-btn is-ghost"
                    onclick="window.open('https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + ' ' + job.company)}', '_blank')"
                    title="Search on LinkedIn">
              🔗 View
            </button>
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
