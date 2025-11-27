# LaunchPath — Career Hub UI (Web Demo)

Bright, human-friendly jobs board and career workspace aimed at internships, startups, and early careers.

## Getting Started
```bash
# from repo root
python -m http.server 3000
# open http://localhost:3000/public/index.html
# jobs board: http://localhost:3000/public/jobs.html
```

## Structure
- `public/index.html` – Home view with navigation counters, sidebar (Resume Builder, Skills, Alerts, Tracker, Internship Planner, Login), curated feed, and assistant panel.
- `public/jobs.html` – Jobs board using the same layout.
- `public/styles.css` – Bright white/blue theme with sharper accent, gentle shadows, cards, sidebar, assistant, chips, match badges.
- `public/app.js` – Job data (including internships/startups), rendering/filtering logic, and lightweight login state.

## Customizing Data
- Edit `latestJobs` in `public/app.js` to change job cards (title, company, domain, level, employmentType, salary, score, stack).

## Features
- Redesigned top nav with numeric indicators (Discover, Saved, Applied, Opportunities) and login action.
- Curated job feed cards showing title, location, employment type, salary, skills, and match score.
- Left sidebar for Resume Builder, Skill Profile, Job Alerts, Application Tracker, Internship Planner, Login/Sign up.
- Right assistant panel (Career Companion) with tips and suggested roles.
- Soft geometric logo, bright palette, smooth spacing, and accessible focus states.

## Notes
- Pure HTML/CSS/JS; deployable to any static host.
- Uses Inter via Google Fonts (swap in `public/styles.css` if desired).
