# BreakIn.ai — Career Hub & Resume Optimization Platform

Bright, human-friendly jobs board and career workspace aimed at internships, startups, and early careers. Includes AI-powered resume optimization with ATS analysis, job description matching, and tailored resume generation.

## Getting Started

### Backend Setup
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server
npm start
# Server will run on http://localhost:3001
```

### Development
```bash
# Run in development mode with ts-node
npm run dev

# Build and watch for changes
npm run watch
```

The backend API will be available at `http://localhost:3001/api` with the following endpoints:
- `GET /api/health` - Health check
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs/search` - Search jobs
- `POST /api/resume/optimize` - Optimize resume for job description
- `POST /api/resume/analyze-jd` - Analyze job description
- `POST /api/resume/score-match` - Score resume-job match

### Frontend
Open `http://localhost:3001/index.html` or `http://localhost:3001/jobs.html` in your browser after starting the server.

## Structure

### Frontend (Modular JavaScript Architecture)
- `public/index.html` – Home view with navigation counters, sidebar, curated feed, and assistant panel
- `public/jobs.html` – Jobs board using the same layout
- `public/styles.css` – Beautiful light blue and white theme with premium shadows and smooth interactions
- `public/js/` – Modular JavaScript architecture:
  - `config.js` – Configuration (API URLs, storage keys, endpoints)
  - `constants.js` – Application constants (labels, enums)
  - `api.js` – API service layer for backend communication
  - `state.js` – State management with LocalStorage persistence
  - `ui.js` – UI rendering and DOM updates
  - `app.js` – Main application logic and event handling

### Backend (TypeScript + Express)
- `src/server.ts` – Express server setup and routing
- `src/middleware/` – Error handling and middleware
- `src/routes/` – API route handlers (resume, jobs)
- `src/modules/` – Resume optimization modules
- `src/orchestrator.ts` – Coordinates all optimization modules

## Resume Optimization Modules
- `atsOptimizer.ts` – ATS-friendly keyword optimization
- `jdAnalyzer.ts` – Job description analysis and requirement extraction
- `bulletRewriter.ts` – Resume bullet point enhancement
- `gapAnalyzer.ts` – Skills gap analysis and recommendations
- `matchScorer.ts` – Resume-to-job match scoring
- `toneNormalizer.ts` – Professional tone consistency
- `tailoring.ts` – Resume tailoring for specific roles
- `resumeGenerator.ts` – AI-powered resume generation
- `orchestrator.ts` – Coordinates all optimization modules

## Customizing Data
- Edit the `jobs` array in `src/routes/jobs.ts` to change job cards (title, company, domain, level, employmentType, salary, score, stack).
- The frontend fetches jobs from the backend API at `/api/jobs`.

## Features
- Beautiful light blue and white UI with sky blue gradient accents
- Redesigned top nav with numeric indicators (Discover, Saved, Applied, Opportunities) and login action
- Curated job feed cards showing title, location, employment type, salary, skills, and match score
- Left sidebar for Resume Builder, Skill Profile, Job Alerts, Application Tracker, Internship Planner, Login/Sign up
- Right assistant panel (Career Companion) with tips and suggested roles
- AI-powered resume optimization and tailoring with ATS analysis
- Soft geometric logo with animated effects, premium shadows, and smooth spacing
- Fully responsive design with accessible focus states
- Job filtering and search functionality
- Save and track job applications

## Architecture Highlights

### Frontend Modular Design
The frontend follows a clean, modular architecture:
- **Separation of Concerns**: API, state, and UI logic are completely separated
- **API Service Layer**: Centralized `ApiService` class handles all backend communication
- **State Management**: `JobsState` class with observable pattern and LocalStorage persistence
- **UI Rendering**: `UIRenderer` class for consistent UI updates
- **Configuration**: Environment-aware API URL detection (localhost vs production)
- **No Framework Dependencies**: Pure vanilla JavaScript for maximum flexibility

### Backend Organization
- **TypeScript**: Full type safety throughout the backend
- **Express Middleware**: Custom error handling and request processing
- **Modular Routes**: Separated resume and jobs endpoints
- **AI Pipeline**: Orchestrated resume optimization with multiple specialized modules

## Notes
- Modular JavaScript architecture with clean separation of concerns
- Uses Inter via Google Fonts (swap in `public/styles.css` if desired)
- TypeScript backend with Express for robust API
- Auto-detects environment (localhost vs production) for API URLs
- LocalStorage for client-side state persistence
