import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { aggregateJobs, getJobBoardLinks, JobSearchParams } from '../services/jobAggregator';

export const jobsRouter = Router();

export type Job = {
  id: string;
  title: string;
  company: string;
  domain: string;
  domainLabel: string;
  level: string;
  location: string;
  employmentType: string;
  workMode: string;
  salary: string;
  compValue: number;
  stack: string[];
  summary: string;
  score: number;
  postedDays: number;
  hot: boolean;
  description?: string;
  applyUrl?: string;
  datePosted?: string;
};

const JOBS_FILE = path.join(__dirname, '../../data/jobs.json');

// Helper functions to read/write jobs
function readJobs(): Job[] {
  try {
    if (!fs.existsSync(JOBS_FILE)) {
      const dir = path.dirname(JOBS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(JOBS_FILE, JSON.stringify(getDefaultJobs(), null, 2));
    }
    const data = fs.readFileSync(JOBS_FILE, 'utf-8');
    const jobs = JSON.parse(data);
    return jobs.length > 0 ? jobs : getDefaultJobs();
  } catch (error) {
    console.error('Error reading jobs:', error);
    return getDefaultJobs();
  }
}

function writeJobs(jobs: Job[]): void {
  try {
    const dir = path.dirname(JOBS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
  } catch (error) {
    console.error('Error writing jobs:', error);
    throw error;
  }
}

function getDefaultJobs(): Job[] {
  return [
    {
      id: "launchpad-backend",
      title: "Backend Intern",
      company: "LaunchPad",
      domain: "startup",
      domainLabel: "Startups",
      level: "intern",
      location: "Remote",
      employmentType: "Internship",
      workMode: "remote",
      salary: "$2k/mo stipend",
      compValue: 24,
      stack: ["Node", "React", "Figma"],
      summary: "Ship small APIs that power student career journeys and co-design flows with PM/Design.",
      score: 84,
      postedDays: 3,
      hot: true,
    },
    {
      id: "spark-product-intern",
      title: "Product Intern",
      company: "Spark",
      domain: "consumer",
      domainLabel: "Consumer",
      level: "intern",
      location: "NYC",
      employmentType: "Hybrid",
      workMode: "hybrid",
      salary: "$3k/mo stipend",
      compValue: 36,
      stack: ["Figma", "User research", "Notion"],
      summary: "Map onboarding funnels, shadow user calls, and deliver quick A/B experiments with design.",
      score: 79,
      postedDays: 5,
      hot: false,
    }
  ];
}

// GET all jobs
jobsRouter.get('/', (_req: Request, res: Response) => {
  const jobs = readJobs();
  res.json({
    success: true,
    data: jobs
  });
});

// GET single job by ID
jobsRouter.get('/:id', (req: Request, res: Response) => {
  const jobs = readJobs();
  const job = jobs.find(j => j.id === req.params.id);

  if (!job) {
    res.status(404).json({
      success: false,
      error: 'Job not found'
    });
    return;
  }

  res.json({
    success: true,
    data: job
  });
});

// POST search jobs
jobsRouter.post('/search', (req: Request, res: Response) => {
  const { query, domain, level, workMode } = req.body;
  let jobs = readJobs();

  if (query) {
    const q = query.toLowerCase();
    jobs = jobs.filter(job =>
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.summary.toLowerCase().includes(q) ||
      job.stack.some(s => s.toLowerCase().includes(q))
    );
  }

  if (domain) {
    jobs = jobs.filter(job => job.domain === domain);
  }

  if (level) {
    jobs = jobs.filter(job => job.level === level);
  }

  if (workMode) {
    jobs = jobs.filter(job => job.workMode === workMode);
  }

  res.json({
    success: true,
    data: jobs
  });
});

// POST create new job
jobsRouter.post('/', (req: Request, res: Response) => {
  try {
    const jobs = readJobs();
    const newJob: Job = {
      id: req.body.id || `job-${Date.now()}`,
      title: req.body.title,
      company: req.body.company,
      domain: req.body.domain || 'startup',
      domainLabel: req.body.domainLabel || 'Startups',
      level: req.body.level || 'junior',
      location: req.body.location || 'Remote',
      employmentType: req.body.employmentType || 'Full-time',
      workMode: req.body.workMode || 'remote',
      salary: req.body.salary || 'Competitive',
      compValue: req.body.compValue || 100,
      stack: req.body.stack || [],
      summary: req.body.summary || '',
      score: req.body.score || 75,
      postedDays: req.body.postedDays || 0,
      hot: req.body.hot || false,
      description: req.body.description,
      applyUrl: req.body.applyUrl,
      datePosted: req.body.datePosted || new Date().toISOString()
    };

    jobs.unshift(newJob);
    writeJobs(jobs);

    res.json({
      success: true,
      data: newJob
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create job'
    });
  }
});

// PUT update job
jobsRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const jobs = readJobs();
    const index = jobs.findIndex(j => j.id === req.params.id);

    if (index === -1) {
      res.status(404).json({
        success: false,
        error: 'Job not found'
      });
      return;
    }

    jobs[index] = { ...jobs[index], ...req.body, id: req.params.id };
    writeJobs(jobs);

    res.json({
      success: true,
      data: jobs[index]
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job'
    });
  }
});

// DELETE job
jobsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    let jobs = readJobs();
    const initialLength = jobs.length;
    jobs = jobs.filter(j => j.id !== req.params.id);

    if (jobs.length === initialLength) {
      res.status(404).json({
        success: false,
        error: 'Job not found'
      });
      return;
    }

    writeJobs(jobs);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete job'
    });
  }
});

// GET external job board links
jobsRouter.get('/external/links', (req: Request, res: Response) => {
  const { keywords, location } = req.query;
  const links = getJobBoardLinks(
    keywords as string,
    location as string
  );

  res.json({
    success: true,
    data: links
  });
});

// POST aggregate jobs from external sources
jobsRouter.post('/external/aggregate', async (req: Request, res: Response) => {
  try {
    const params: JobSearchParams = {
      keywords: req.body.keywords || 'software engineer',
      location: req.body.location,
      experienceLevel: req.body.experienceLevel,
      remote: req.body.remote,
      limit: req.body.limit || 20
    };

    const jobs = await aggregateJobs(params);

    res.json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('Error aggregating jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to aggregate jobs from external sources'
    });
  }
});
