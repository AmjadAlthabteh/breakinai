import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { resumeRouter } from './routes/resume';
import { jobsRouter } from './routes/jobs';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/resume', resumeRouter);
app.use('/api/jobs', jobsRouter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`\u2705 Server running on http://localhost:${port}`);
  console.log(`\u2705 API available at http://localhost:${port}/api`);
});
