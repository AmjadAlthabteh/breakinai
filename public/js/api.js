class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success && result.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async fetchJobs() {
    const result = await this.get(CONFIG.API_ENDPOINTS.JOBS);
    return result.data || [];
  }

  async searchJobs(filters) {
    const result = await this.post(CONFIG.API_ENDPOINTS.JOB_SEARCH, filters);
    return result.data || [];
  }

  async optimizeResume(profile, jobDescription, style = 'concise') {
    const result = await this.post(CONFIG.API_ENDPOINTS.RESUME_OPTIMIZE, {
      profile,
      jobDescription,
      style,
    });
    return result.data;
  }

  async analyzeJobDescription(jobDescription, userSkills = []) {
    const result = await this.post(CONFIG.API_ENDPOINTS.ANALYZE_JD, {
      jobDescription,
      userSkills,
    });
    return result.data;
  }

  async scoreMatch(resume, analysis) {
    const result = await this.post(CONFIG.API_ENDPOINTS.SCORE_MATCH, {
      resume,
      analysis,
    });
    return result.data;
  }

  async checkHealth() {
    return this.get(CONFIG.API_ENDPOINTS.HEALTH);
  }
}

if (typeof window !== 'undefined') {
  window.ApiService = ApiService;
  window.api = new ApiService(CONFIG.API_BASE_URL);
}
