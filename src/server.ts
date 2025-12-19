import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { resumeRouter } from './routes/resume';
import { jobsRouter } from './routes/jobs';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger, performanceMonitor } from './middleware/requestLogger';
import { logger } from './utils/logger';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Enhanced middleware stack
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);
app.use(performanceMonitor(500));
app.use(express.static('public'));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global process-level error handling and graceful shutdown hooks
process.on('unhandledRejection', (reason: unknown) => {
  logger.error(`Unhandled Rejection: ${reason instanceof Error ? reason.message : String(reason)}`);
});

process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
});

app.use('/api/resume', resumeRouter);
app.use('/api/jobs', jobsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  logger.success('🚀 BreakIn.ai Server Started Successfully!');
  logger.info(`Server: http://localhost:${port}`);
  logger.info(`API: http://localhost:${port}/api`);
  logger.info(`Frontend: http://localhost:${port}/index.html`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.success('🐻 Bear mascot is ready to help users!');
});
