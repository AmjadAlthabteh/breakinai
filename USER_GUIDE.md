# BreakIn.ai User Guide

## Overview
BreakIn.ai is an AI-powered career platform that helps you optimize your resume and discover job opportunities.

## Features

### 1. Resume Optimizer
**Location:** `http://localhost:3001/optimize.html`

Optimize your resume for any job description with AI assistance.

**How to use:**
1. Paste your current resume in the "Your Resume" text area
2. Paste the target job description in the "Job Description" text area
3. Select your preferred style (Concise, Detailed, or Technical)
4. Click "Optimize Resume"
5. View your results including:
   - **Match Score**: How well you match the job (0-100)
   - **Optimized Resume**: AI-tailored resume ready to copy
   - **Skill Gaps**: Missing skills you should develop
   - **Recommendations**: Actionable tips to improve
   - **Job Analysis**: Key requirements and skills needed

**Tips:**
- Use complete resume text for best results
- Include specific metrics and achievements
- Paste the full job description, not just a summary
- Try different styles to see what works best

### 2. Job Discovery
**Location:** `http://localhost:3001/jobs.html`

Browse curated job opportunities across various industries.

**Features:**
- Filter by industry (Fintech, ML/Data, Health, Infrastructure, Consumer, Startups)
- Filter by experience level (Internship, Junior, Senior, Lead)
- Filter by work mode (Remote, Hybrid, On-site)
- Sort by match score, posting date, or compensation
- Save jobs for later
- Track applications

**How to use:**
1. Browse available jobs in the grid
2. Use filters to narrow down opportunities
3. Search by keywords (title, company, tech stack)
4. Click "Save role" to bookmark interesting positions
5. Click "Mark applied" to track your applications

### 3. Home Page
**Location:** `http://localhost:3001/index.html`

Your starting point with quick access to all features.

## API Endpoints

The application connects to a backend API:

### Resume Optimization
- `POST /api/resume/optimize` - Optimize resume for job description
- `POST /api/resume/analyze-jd` - Analyze job description
- `POST /api/resume/score-match` - Calculate match score

### Job Management
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs/search` - Search jobs with filters

### Health Check
- `GET /api/health` - Check API status

## Local Development

### Start the Server
```bash
# Build TypeScript
npm run build

# Start production server
npm start

# Or use development mode with auto-reload
npm run dev
```

### Access the Application
- Home: http://localhost:3001/index.html
- Resume Optimizer: http://localhost:3001/optimize.html
- Job Browser: http://localhost:3001/jobs.html

## Features in Detail

### Resume Optimization Process

1. **Input Processing**
   - Parses resume text to extract structure
   - Identifies name, contact info, experience, skills
   - Analyzes job description for requirements

2. **AI Analysis**
   - Matches skills to job requirements
   - Identifies keyword gaps
   - Scores overall compatibility

3. **Optimization**
   - Tailors resume content to job
   - Improves ATS compatibility
   - Enhances bullet points with action verbs
   - Adjusts tone and style

4. **Results**
   - Optimized resume ready to use
   - Match score with explanation
   - Skill gap analysis
   - Personalized recommendations

### Job Management

**Save Jobs:**
- Click "Save role" on any job card
- Access saved jobs via the "Saved" counter
- Persists in browser localStorage

**Track Applications:**
- Click "Mark applied" when you apply
- Track application count
- Monitor your application pipeline

**Filters:**
- Combine multiple filters for precise results
- Search works across titles, companies, and tech stacks
- Sort by what matters most to you

## Data Storage

### Local Storage
- Saved jobs list
- Applied jobs tracking
- All data stays in your browser

### Server Data
- Job listings fetched from API
- Resume optimizations processed server-side
- No resume data is permanently stored

## Troubleshooting

### Resume Optimizer Not Working
- Check that both resume and job description are filled
- Verify backend server is running on port 3001
- Check browser console for errors
- Try a simpler resume format

### Jobs Not Loading
- Verify API connection at http://localhost:3001/api/health
- Check network tab in browser dev tools
- Restart the server if needed

### Build Errors
```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

## Best Practices

### Resume Optimization
1. Use complete, well-formatted resume text
2. Include quantifiable achievements
3. Paste full job descriptions
4. Try different optimization styles
5. Review and personalize results

### Job Search
1. Use specific keywords in search
2. Combine filters for better results
3. Save interesting positions early
4. Track applications immediately
5. Review match scores

## Future Enhancements

Planned features:
- PDF resume upload
- Resume templates
- Cover letter generation
- Interview preparation
- Application tracking dashboard
- Email notifications
- Chrome extension

## Support

For issues or questions:
- Check this guide first
- Review the README.md for technical details
- Check IMPROVEMENTS.md for recent changes
- Report bugs via GitHub issues

## Quick Start Checklist

- [ ] Server is running (`npm start`)
- [ ] Navigate to http://localhost:3001
- [ ] Explore the home page
- [ ] Try optimizing a resume
- [ ] Browse job listings
- [ ] Save a few jobs
- [ ] Mark a job as applied

You're ready to use BreakIn.ai! 🚀
