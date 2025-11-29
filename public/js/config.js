const CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api',

  STORAGE_KEYS: {
    SAVED_JOBS: 'lp_saved',
    APPLIED_JOBS: 'lp_applied',
  },

  API_ENDPOINTS: {
    JOBS: '/jobs',
    JOB_SEARCH: '/jobs/search',
    RESUME_OPTIMIZE: '/resume/optimize',
    ANALYZE_JD: '/resume/analyze-jd',
    SCORE_MATCH: '/resume/score-match',
    HEALTH: '/health',
  },
};

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
