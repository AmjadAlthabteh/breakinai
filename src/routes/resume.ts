import { Router, Request, Response } from 'express';
import { orchestrate } from '../orchestrator';
import { UserProfile, JobDescription } from '../types';
import { NoopLLM } from '../llm';
import { validateRequest, resumeOptimizationSchema, apiLimiter } from '../middleware/validation';

export const resumeRouter = Router();

// Simple in-memory cache for optimization results
const optimizationCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

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

    // Generate cache key
    const cacheKey = JSON.stringify({ profile, jobDescription, style: style || 'concise' });

    // Check cache
    if (useCache && optimizationCache.has(cacheKey)) {
      const cached = optimizationCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        res.json({
          success: true,
          data: cached.result,
          cached: true,
          timestamp: new Date().toISOString()
        });
        return;
      } else {
        optimizationCache.delete(cacheKey);
      }
    }

    const userProfile: UserProfile = profile;
    const jd: JobDescription = jobDescription;

    const llm = new NoopLLM();
    const result = await orchestrate(userProfile, jd, {
      style: style || 'concise',
      llm
    });

    // Cache result
    if (useCache) {
      optimizationCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });

      // Clean old cache entries
      if (optimizationCache.size > 100) {
        const oldestKey = Array.from(optimizationCache.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
        optimizationCache.delete(oldestKey);
      }
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
  res.json({
    success: true,
    service: 'resume-optimizer',
    status: 'healthy',
    cacheSize: optimizationCache.size,
    timestamp: new Date().toISOString()
  });
});
