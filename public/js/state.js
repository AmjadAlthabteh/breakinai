class JobsState {
  constructor() {
    this.jobs = [];
    this.saved = this.loadSet(CONFIG.STORAGE_KEYS.SAVED_JOBS);
    this.applied = this.loadSet(CONFIG.STORAGE_KEYS.APPLIED_JOBS);
    this.listeners = [];
  }

  loadSet(key) {
    try {
      const raw = localStorage.getItem(key);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return new Set();
    }
  }

  persistSet(key, set) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch (error) {
      console.error(`Failed to persist ${key} to localStorage:`, error);
    }
  }

  setJobs(jobs) {
    this.jobs = jobs;
    this.notify();
  }

  getJobs() {
    return this.jobs;
  }

  toggleSaved(jobId) {
    if (this.saved.has(jobId)) {
      this.saved.delete(jobId);
    } else {
      this.saved.add(jobId);
    }
    this.persistSet(CONFIG.STORAGE_KEYS.SAVED_JOBS, this.saved);
    this.notify();
  }

  toggleApplied(jobId) {
    if (this.applied.has(jobId)) {
      this.applied.delete(jobId);
    } else {
      this.applied.add(jobId);
    }
    this.persistSet(CONFIG.STORAGE_KEYS.APPLIED_JOBS, this.applied);
    this.notify();
  }

  isSaved(jobId) {
    return this.saved.has(jobId);
  }

  isApplied(jobId) {
    return this.applied.has(jobId);
  }

  getSavedCount() {
    return this.saved.size;
  }

  getAppliedCount() {
    return this.applied.size;
  }

  getHotJobsCount() {
    return this.jobs.filter(job => job.hot).length;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this));
  }
}

if (typeof window !== 'undefined') {
  window.JobsState = JobsState;
  window.jobsState = new JobsState();
}
