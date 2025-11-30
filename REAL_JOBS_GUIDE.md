# Real Jobs Integration Guide

This guide explains how to add real job listings to your BreakIn.ai platform.

## Method 1: Admin Interface (Easiest)

### Access the Admin Page
1. Start your server: `npm start`
2. Navigate to: `http://localhost:3001/admin.html`
3. Use the form to add jobs manually

### Adding a Job
1. Fill in the required fields:
   - Job Title (e.g., "Senior Software Engineer")
   - Company (e.g., "Google")
   - Location (e.g., "Remote", "NYC", "San Francisco")
   - Industry (Startups, Fintech, AI/ML, Health, Infrastructure, Consumer)
   - Experience Level (Internship, Junior, Senior, Lead)
   - Work Mode (Remote, Hybrid, On-site)
   - Employment Type (Full-time, Part-time, Internship, Contract)

2. Fill in optional fields:
   - Salary (e.g., "$120k-$150k")
   - Tech Stack (comma-separated, e.g., "React, Node.js, Python")
   - Short Summary (1-2 sentences)
   - Full Description
   - Application URL
   - Posted Days Ago
   - Mark as "Hot Lead" (featured job)

3. Click "Add Job"

## Method 2: Import from Job Boards

### Where to Find Real Jobs

**LinkedIn Jobs**
- Go to: https://www.linkedin.com/jobs/
- Search for jobs in your niche
- Copy job details and paste into admin form

**Indeed**
- Go to: https://www.indeed.com/
- Search for jobs
- Copy job details manually

**AngelList (Startups)**
- Go to: https://angel.co/jobs
- Great for startup jobs
- Copy job details

**RemoteOK (Remote Jobs)**
- Go to: https://remoteok.com/
- Focused on remote positions
- Easy to copy job details

**We Work Remotely**
- Go to: https://weworkremotely.com/
- Remote jobs across industries

### How to Import:
1. Find a job you like on any job board
2. Copy the job details
3. Go to `http://localhost:3001/admin.html`
4. Paste the details into the form
5. Click "Add Job"

## Method 3: Using Job APIs (Advanced)

### Free Job APIs

#### 1. Adzuna API (Free Tier)
- Sign up: https://developer.adzuna.com/
- Free tier: 1000 calls/month
- Coverage: Worldwide jobs

**Example:**
```javascript
const fetch = require('node-fetch');

async function fetchFromAdzuna() {
  const APP_ID = 'your_app_id';
  const APP_KEY = 'your_app_key';
  const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=20`;

  const response = await fetch(url);
  const data = await response.json();

  // Transform to your format
  return data.results.map(job => ({
    title: job.title,
    company: job.company.display_name,
    location: job.location.display_name,
    summary: job.description.substring(0, 200),
    salary: job.salary_min ? `$${job.salary_min}-$${job.salary_max}` : 'Competitive',
    // ... map other fields
  }));
}
```

#### 2. Reed API (UK Jobs)
- Sign up: https://www.reed.co.uk/developers
- Free tier available
- UK-focused

#### 3. The Muse API
- API: https://www.themuse.com/developers/api/v2
- Free to use
- Good for tech jobs

#### 4. GitHub Jobs (Note: Deprecated but alternatives exist)
- Use alternatives like:
  - https://findwork.dev/
  - https://remotive.io/

### Adding API Support to Your Backend

Create a new route `src/routes/jobImport.ts`:

```typescript
import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';

export const jobImportRouter = Router();

jobImportRouter.post('/import/adzuna', async (req: Request, res: Response) => {
  try {
    const { query, location } = req.body;
    const APP_ID = process.env.ADZUNA_APP_ID;
    const APP_KEY = process.env.ADZUNA_APP_KEY;

    const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=20&what=${query}&where=${location}`;

    const response = await fetch(url);
    const data = await response.json();

    const jobs = data.results.map(job => ({
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      summary: job.description.substring(0, 200),
      salary: job.salary_min ? `$${job.salary_min}-$${job.salary_max}` : 'Competitive',
      description: job.description,
      applyUrl: job.redirect_url,
      domain: 'startup',
      domainLabel: 'Startups',
      level: 'junior',
      workMode: 'remote',
      employmentType: 'Full-time',
      stack: [],
      score: 75,
      postedDays: 0,
      hot: false,
      compValue: job.salary_max || 100
    }));

    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Method 4: Bulk Import via JSON

### Create a JSON file with jobs

Create `import_jobs.json`:
```json
[
  {
    "title": "Senior Software Engineer",
    "company": "TechCorp",
    "location": "Remote",
    "salary": "$150k-$180k",
    "domain": "startup",
    "domainLabel": "Startups",
    "level": "senior",
    "workMode": "remote",
    "employmentType": "Full-time",
    "stack": ["React", "Node.js", "AWS"],
    "summary": "Build scalable web applications",
    "description": "Full job description here...",
    "applyUrl": "https://techcorp.com/careers/apply",
    "score": 85,
    "postedDays": 2,
    "hot": true,
    "compValue": 180
  }
]
```

### Import script

Create `scripts/import-jobs.js`:
```javascript
const fs = require('fs');
const path = require('path');

const jobsFile = path.join(__dirname, '../data/jobs.json');
const importFile = path.join(__dirname, '../import_jobs.json');

// Read existing jobs
const existingJobs = JSON.parse(fs.readFileSync(jobsFile, 'utf-8'));

// Read jobs to import
const newJobs = JSON.parse(fs.readFileSync(importFile, 'utf-8'));

// Add IDs to new jobs
const jobsWithIds = newJobs.map(job => ({
  ...job,
  id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}));

// Combine and save
const allJobs = [...jobsWithIds, ...existingJobs];
fs.writeFileSync(jobsFile, JSON.stringify(allJobs, null, 2));

console.log(`Imported ${newJobs.length} jobs!`);
```

Run with:
```bash
node scripts/import-jobs.js
```

## Method 5: Web Scraping (Careful - Check Terms of Service)

**Important:** Always check the website's Terms of Service and robots.txt before scraping.

### Example with Puppeteer

```javascript
const puppeteer = require('puppeteer');

async function scrapeJobs() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://example-job-board.com/jobs');

  const jobs = await page.evaluate(() => {
    const jobCards = document.querySelectorAll('.job-card');

    return Array.from(jobCards).map(card => ({
      title: card.querySelector('.job-title')?.textContent.trim(),
      company: card.querySelector('.company-name')?.textContent.trim(),
      location: card.querySelector('.location')?.textContent.trim(),
      summary: card.querySelector('.description')?.textContent.trim()
    }));
  });

  await browser.close();
  return jobs;
}
```

## Recommended Sources for Real Jobs

### Tech Jobs
1. **LinkedIn Jobs** - Largest professional network
2. **Indeed** - General job board
3. **Glassdoor** - Jobs with salary data
4. **AngelList** - Startup jobs
5. **RemoteOK** - Remote tech jobs
6. **We Work Remotely** - Remote jobs
7. **Hacker News Who's Hiring** - Monthly thread

### Industry-Specific
- **Fintech**: Built In, eFinancialCareers
- **Healthcare**: Health eCareers
- **AI/ML**: AI Jobs Board, Kaggle
- **Startups**: AngelList, Y Combinator Jobs

## Quick Start: Add Your First Real Job

1. **Find a job you like on LinkedIn**
   - Search for "Software Engineer Remote"
   - Pick a real job posting

2. **Copy the details**
   - Job title
   - Company name
   - Location
   - Salary (if listed)
   - Required skills
   - Job description

3. **Go to the admin page**
   - `http://localhost:3001/admin.html`

4. **Fill in the form**
   - Paste job title
   - Paste company name
   - Paste location
   - Select appropriate dropdowns
   - Add tech stack (comma-separated)
   - Paste short summary
   - Paste full description
   - Add application URL

5. **Click "Add Job"**

6. **View it on the jobs page**
   - `http://localhost:3001/jobs.html`

## Best Practices

1. **Keep jobs updated**
   - Remove old postings (30+ days)
   - Add new jobs regularly
   - Update "Posted Days Ago" field

2. **Categorize correctly**
   - Use appropriate industry tags
   - Set correct experience levels
   - Tag work mode accurately

3. **Write good summaries**
   - Keep it to 1-2 sentences
   - Highlight key requirements
   - Make it engaging

4. **Include apply URLs**
   - Direct links work best
   - Company career pages are good
   - LinkedIn job links work too

## Automation Ideas

1. **Daily job scraper**
   - Run a script daily to fetch new jobs
   - From LinkedIn, Indeed, or job APIs
   - Auto-import to your platform

2. **RSS feed integration**
   - Many job boards have RSS feeds
   - Parse and import automatically

3. **Email job submissions**
   - Let users submit jobs via email
   - Parse and add to database

## Need Help?

If you need a specific job board integrated or have questions:
- Check the API documentation of the job board
- Look for RSS feeds
- Consider manual curation (quality over quantity)
- Start with 10-20 real jobs and grow from there

## Example: Copy This Job to Your Platform

Here's a real job format you can use right now:

**Job Title:** Full Stack Engineer
**Company:** Vercel
**Location:** Remote (US)
**Salary:** $140k-$200k
**Stack:** React, Next.js, TypeScript, Node.js
**Summary:** Build the future of web development at Vercel, creators of Next.js. Work on performance, DevEx, and scale.
**Level:** Senior
**Work Mode:** Remote
**Apply URL:** https://vercel.com/careers

Just paste this into your admin form and you have your first real job! 🚀
