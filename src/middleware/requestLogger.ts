import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Request Logging Middleware
 * Logs all incoming requests with timing
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // Log incoming request
  logger.logRequest(req.method, req.path, ip);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    const logMethod = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'success';

    logger[logMethod](`${req.method} ${req.path} - ${statusCode}`, {
      duration: `${duration}ms`,
      ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
}

/**
 * Performance Monitor Middleware
 * Tracks slow requests
 */
export function performanceMonitor(threshold: number = 500) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      if (duration > threshold) {
        logger.warn(`Slow request detected: ${req.method} ${req.path}`, {
          duration: `${duration}ms`,
          threshold: `${threshold}ms`
        });
      }
    });

    next();
  };
}
