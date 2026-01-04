import { Router, Request, Response } from 'express';
import { orchestrate } from '../orchestrator';
import { UserProfile, JobDescription } from '../types';
import { NoopLLM } from '../llm';
import { validateRequest, resumeOptimizationSchema, apiLimiter } from '../middleware/validation';
import { CacheManager, createCacheKey } from '../utils/cacheManager';

export const resumeRouter = Router();

// Smart cache manager with TTL and LRU eviction
const optimizationCache = new CacheManager<any>({
  defaultTTL: 60 * 60 * 1000, // 1 hour
  maxSize: 200 // Store up to 200 optimization results
});

// Periodic cache cleanup (every 10 minutes)
setInterval(() => {
  const cleaned = optimizationCache.cleanupExpired();
  if (cleaned > 0) {
    console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
  }
}, 10 * 60 * 1000);

// Apply rate limiting to all resume routes
resumeRouter.use(apiLimiter.middleware());

resumeRouter.post('/optimize', async (req: Request, res: Response) => {
  try {
    const { profile, jobDescription, style, useCache = true } = req.body;

    // Enhanced validation
    if (!profile || !jobDescription) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          profile: !profile ? 'Profile is required' : undefined,
          jobDescription: !jobDescription ? 'Job description is required' : undefined
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Generate cache key using consistent hashing
    const cacheKey = createCacheKey({ profile, jobDescription, style: style || 'concise' });

    // Check cache with smart retrieval
    if (useCache) {
      const cachedResult = optimizationCache.get(cacheKey);
      if (cachedResult) {
        res.json({
          success: true,
          data: cachedResult,
          cached: true,
          cacheStats: optimizationCache.getStats(),
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    const userProfile: UserProfile = profile;
    const jd: JobDescription = jobDescription;

    const llm = new NoopLLM();
    const result = await orchestrate(userProfile, jd, {
      style: style || 'concise',
      llm
    });

    // Cache result with smart management (auto-eviction, TTL)
    if (useCache) {
      optimizationCache.set(cacheKey, result);
    }

    res.json({
      success: true,
      data: result,
      cached: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Resume optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize resume',
      message: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

resumeRouter.post('/analyze-jd', async (req: Request, res: Response) => {
  try {
    const { jobDescription, userSkills } = req.body;

    if (!jobDescription) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: jobDescription',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { analyzeJD } = await import('../modules/jdAnalyzer');
    const llm = new NoopLLM();
    const analysis = await analyzeJD(jobDescription, userSkills || [], llm);

    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('JD analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze job description',
      message: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

resumeRouter.post('/score-match', async (req: Request, res: Response) => {
  try {
    const { resume, analysis } = req.body;

    if (!resume || !analysis) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          resume: !resume ? 'Resume is required' : undefined,
          analysis: !analysis ? 'Analysis is required' : undefined
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { scoreMatch } = await import('../modules/matchScorer');
    const score = scoreMatch(resume, analysis);

    res.json({
      success: true,
      data: score,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Match scoring error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to score match',
      message: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint for resume service
resumeRouter.get('/health', (_req: Request, res: Response) => {
  const cacheStats = optimizationCache.getStats();
  res.json({
    success: true,
    service: 'resume-optimizer',
    status: 'healthy',
    cache: cacheStats,
    timestamp: new Date().toISOString()
  });
});

// Cache statistics endpoint
resumeRouter.get('/cache/stats', (_req: Request, res: Response) => {
  const stats = optimizationCache.getStats();
  res.json({
    success: true,
    data: {
      ...stats,
      hitRatePercent: `${(stats.hitRate * 100).toFixed(2)}%`,
      avgAccessPerEntry: stats.size > 0 ? (stats.hits / stats.size).toFixed(2) : '0'
    },
    timestamp: new Date().toISOString()
  });
});

// Cache invalidation endpoint (useful for debugging/admin)
resumeRouter.post('/cache/invalidate', (req: Request, res: Response) => {
  const { pattern } = req.body;

  if (pattern) {
    const regex = new RegExp(pattern);
    const count = optimizationCache.invalidatePattern(regex);
    res.json({
      success: true,
      message: `Invalidated ${count} cache entries matching pattern: ${pattern}`,
      timestamp: new Date().toISOString()
    });
  } else {
    optimizationCache.clear();
    res.json({
      success: true,
      message: 'All cache entries cleared',
      timestamp: new Date().toISOString()
    });
  }
});

// Cache cleanup endpoint
resumeRouter.post('/cache/cleanup', (_req: Request, res: Response) => {
  const cleaned = optimizationCache.cleanupExpired();
  res.json({
    success: true,
    message: `Cleaned up ${cleaned} expired cache entries`,
    remaining: optimizationCache.size(),
    timestamp: new Date().toISOString()
  });
});

// Bullet strength analyzer endpoint
resumeRouter.post('/analyze-bullets', async (req: Request, res: Response) => {
  try {
    const { bullets } = req.body;

    if (!bullets || !Array.isArray(bullets)) {
      res.status(400).json({
        success: false,
        error: 'bullets array is required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { analyzeBullets, getOverallResumeStrength } = await import('../modules/bulletStrengthAnalyzer');
    const analysis = analyzeBullets(bullets);
    const overallStrength = getOverallResumeStrength(bullets);

    res.json({
      success: true,
      data: {
        bulletAnalysis: analysis,
        overallStrength
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bullet analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze bullets',
      message: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});
