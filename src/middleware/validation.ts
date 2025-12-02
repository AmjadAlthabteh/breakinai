import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Enhanced Validation Middleware with Better Error Handling
 */

// Resume optimization validation schema
export const resumeOptimizationSchema = z.object({
  resume: z.string().min(50, 'Resume must be at least 50 characters long').max(10000, 'Resume is too long (max 10000 characters)'),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters long').max(5000, 'Job description is too long (max 5000 characters)'),
  tone: z.enum(['professional', 'concise', 'detailed']).optional(),
  targetRole: z.string().optional()
});

// Job creation validation schema
export const jobCreationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  company: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name is too long'),
  location: z.string().min(2, 'Location is required').max(100, 'Location is too long'),
  description: z.string().optional(),
  applyUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  salary: z.string().optional(),
  employmentType: z.string().optional(),
  domain: z.string().optional(),
  level: z.string().optional(),
  workMode: z.string().optional(),
  stack: z.array(z.string()).optional(),
  summary: z.string().optional()
});

// Job search validation schema
export const jobSearchSchema = z.object({
  query: z.string().optional(),
  domain: z.string().optional(),
  level: z.string().optional(),
  workMode: z.string().optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional()
});

/**
 * Generic validation middleware factory
 */
export function validateRequest(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
        return;
      }

      // Pass other errors to error handler
      next(error);
    }
  };
}

/**
 * Validate query parameters
 */
export function validateQuery(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: errors
        });
        return;
      }

      next(error);
    }
  };
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const identifier = req.ip || 'unknown';
      const now = Date.now();

      if (!this.requests.has(identifier)) {
        this.requests.set(identifier, []);
      }

      const timestamps = this.requests.get(identifier)!;
      const recentTimestamps = timestamps.filter(t => now - t < this.windowMs);

      if (recentTimestamps.length >= this.maxRequests) {
        res.status(429).json({
          success: false,
          error: 'Too many requests',
          message: `Rate limit exceeded. Max ${this.maxRequests} requests per ${this.windowMs / 1000} seconds.`,
          retryAfter: Math.ceil((recentTimestamps[0] + this.windowMs - now) / 1000)
        });
        return;
      }

      recentTimestamps.push(now);
      this.requests.set(identifier, recentTimestamps);

      next();
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter(t => now - t < this.windowMs);
      if (recent.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recent);
      }
    }
  }
}

// Create rate limiter instances
export const generalLimiter = new RateLimiter(30, 60000); // 30 requests per minute
export const apiLimiter = new RateLimiter(10, 60000); // 10 requests per minute for API calls

// Clean up old rate limit data every 5 minutes
setInterval(() => {
  generalLimiter.cleanup();
  apiLimiter.cleanup();
}, 5 * 60 * 1000);
