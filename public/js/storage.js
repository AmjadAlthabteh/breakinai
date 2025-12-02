/**
 * Enhanced Local Storage Manager
 * Handles all browser storage with error handling and compression
 */

class StorageManager {
  constructor() {
    this.prefix = 'breakin_';
    this.version = '1.0';
  }

  /**
   * Save data to localStorage
   */
  save(key, data) {
    try {
      const prefixedKey = this.prefix + key;
      const value = JSON.stringify({
        data,
        version: this.version,
        timestamp: Date.now()
      });
      localStorage.setItem(prefixedKey, value);
      return true;
    } catch (error) {
      console.error('Storage save error:', error);
      return false;
    }
  }

  /**
   * Load data from localStorage
   */
  load(key, defaultValue = null) {
    try {
      const prefixedKey = this.prefix + key;
      const value = localStorage.getItem(prefixedKey);

      if (!value) return defaultValue;

      const parsed = JSON.parse(value);

      // Check if data is expired (older than 30 days)
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > thirtyDaysInMs) {
        this.remove(key);
        return defaultValue;
      }

      return parsed.data;
    } catch (error) {
      console.error('Storage load error:', error);
      return defaultValue;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(key) {
    try {
      const prefixedKey = this.prefix + key;
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  /**
   * Clear all app data
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Save user preferences
   */
  savePreferences(prefs) {
    return this.save('preferences', prefs);
  }

  /**
   * Load user preferences
   */
  loadPreferences() {
    return this.load('preferences', {
      theme: 'light',
      notifications: true,
      autoSave: true
    });
  }

  /**
   * Save resume draft
   */
  saveResumeDraft(resume) {
    const success = this.save('resume_draft', resume);
    if (success && window.bearMascot) {
      window.bearMascot.showMessage('Resume saved! 💾');
    }
    return success;
  }

  /**
   * Load resume draft
   */
  loadResumeDraft() {
    return this.load('resume_draft');
  }

  /**
   * Save recent searches
   */
  saveSearch(searchTerm) {
    const searches = this.load('recent_searches', []);

    // Add to beginning, remove duplicates, limit to 10
    const updated = [searchTerm, ...searches.filter(s => s !== searchTerm)].slice(0, 10);

    return this.save('recent_searches', updated);
  }

  /**
   * Get recent searches
   */
  getRecentSearches() {
    return this.load('recent_searches', []);
  }

  /**
   * Track usage statistics
   */
  incrementUsage(feature) {
    const stats = this.load('usage_stats', {});
    stats[feature] = (stats[feature] || 0) + 1;
    stats.lastUsed = Date.now();
    return this.save('usage_stats', stats);
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return this.load('usage_stats', {});
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.storage = new StorageManager();
}
