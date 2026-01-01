# BreakIn.ai API Documentation

Complete API reference for the BreakIn.ai backend server.

## Base URL

```
http://localhost:3001/api
```

## Table of Contents

- [Health Check](#health-check)
- [Resume Endpoints](#resume-endpoints)
- [Jobs Endpoints](#jobs-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Authentication

Currently, the API does not require authentication. This may change in future versions.

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Health Check

### GET /api/health

Check if the server is running.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Resume Endpoints

### POST /api/resume/optimize

Optimize a resume for a specific job description.

**Request Body:**

```json
{
  "profile": {
    "id": "user-123",
    "name": "John Doe",
    "contact": "john@example.com",
    "location": "Remote",
    "summary": "Backend engineer with 5 years experience",
    "work_history": [
      {
        "company": "Tech Corp",
        "title": "Senior Engineer",
        "start": "2020-01",
        "end": "2024-12",
        "bullets": [
          { "original": "Built scalable APIs" }
        ]
      }
    ],
    "skills": [
      { "name": "JavaScript", "years": 5 }
    ]
  },
  "jobDescription": {
    "id": "job-1",
    "title": "Senior Backend Engineer",
    "company": "Company XYZ",
    "raw_text": "Looking for a senior backend engineer..."
  },
  "style": "concise",
  "useCache": true
}
```

**Parameters:**

- `profile` (object, required): User's profile information
- `jobDescription` (object, required): Target job description
- `style` (string, optional): Resume style - `concise`, `executive`, or `detailed`. Default: `concise`
- `useCache` (boolean, optional): Use cached results if available. Default: `true`

**Response:**

```json
{
  "success": true,
  "data": {
    "resume": { ... },
    "analysis": { ... },
    "score": 85
  },
  "cached": false,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### POST /api/resume/analyze-jd

Analyze a job description and extract requirements.

**Request Body:**

```json
{
  "jobDescription": {
    "raw_text": "We are looking for a Senior Backend Engineer with Go and Kubernetes experience..."
  },
  "userSkills": ["Go", "Docker", "PostgreSQL"]
}
```

**Parameters:**

- `jobDescription` (object, required): Job description to analyze
- `userSkills` (array, optional): User's current skills for gap analysis

**Response:**

```json
{
  "success": true,
  "data": {
    "required_skills": ["Go", "Kubernetes"],
    "nice_to_have": ["Terraform", "AWS"],
    "missing_skills": ["Kubernetes"],
    "experience_level": "Senior",
    "key_responsibilities": [...]
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### POST /api/resume/score-match

Score how well a resume matches a job analysis.

**Request Body:**

```json
{
  "resume": {
    "skills": ["Go", "Docker", "PostgreSQL"],
    "experience_years": 5
  },
  "analysis": {
    "required_skills": ["Go", "Kubernetes"],
    "nice_to_have": ["Terraform"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overall_score": 75,
    "skill_match": 60,
    "experience_match": 90,
    "missing_critical": ["Kubernetes"]
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### GET /api/resume/health

Health check for resume service.

**Response:**

```json
{
  "success": true,
  "service": "resume-optimizer",
  "status": "healthy",
  "cacheSize": 5,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Jobs Endpoints

### GET /api/jobs

Get all available jobs.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "job-1",
      "title": "Backend Engineer",
      "company": "Tech Corp",
      "domain": "startup",
      "level": "senior",
      "location": "Remote",
      "employmentType": "Full-time",
      "workMode": "remote",
      "salary": "$120k - $180k",
      "stack": ["Node", "React", "PostgreSQL"],
      "summary": "Build scalable backend systems...",
      "score": 85,
      "postedDays": 3,
      "hot": true
    }
  ]
}
```

---

### GET /api/jobs/:id

Get a specific job by ID.

**Parameters:**

- `id` (string): Job ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "job-1",
    "title": "Backend Engineer",
    ...
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Job not found"
}
```

---

### POST /api/jobs/search

Search for jobs with filters.

**Request Body:**

```json
{
  "query": "backend",
  "domain": "startup",
  "level": "senior",
  "workMode": "remote"
}
```

**Parameters:**

- `query` (string, optional): Search query
- `domain` (string, optional): Job domain filter
- `level` (string, optional): Experience level filter
- `workMode` (string, optional): Work mode filter (remote, hybrid, onsite)

**Response:**

```json
{
  "success": true,
  "data": [ ... ]
}
```

---

### POST /api/jobs

Create a new job posting.

**Request Body:**

```json
{
  "title": "Senior Backend Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "employmentType": "Full-time",
  "salary": "$150k - $200k",
  "description": "We are looking for...",
  "stack": ["Go", "PostgreSQL", "Kubernetes"],
  "summary": "Build scalable backend systems"
}
```

**Required Fields:**

- `title` (string): Job title
- `company` (string): Company name
- `location` (string): Job location

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "job-123",
    "title": "Senior Backend Engineer",
    ...
  }
}
```

---

### PUT /api/jobs/:id

Update an existing job.

**Parameters:**

- `id` (string): Job ID

**Request Body:** Same as POST /api/jobs

**Response:**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE /api/jobs/:id

Delete a job posting.

**Parameters:**

- `id` (string): Job ID

**Response:**

```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

### GET /api/jobs/external/links

Get links to external job boards.

**Query Parameters:**

- `keywords` (string, optional): Search keywords
- `location` (string, optional): Job location

**Response:**

```json
{
  "success": true,
  "data": {
    "linkedin": "https://www.linkedin.com/jobs/search/?keywords=...",
    "indeed": "https://www.indeed.com/jobs?q=...",
    "glassdoor": "https://www.glassdoor.com/Job/jobs.htm?...",
    ...
  }
}
```

---

### POST /api/jobs/external/aggregate

Aggregate jobs from external sources (LinkedIn, Indeed, Glassdoor).

**Request Body:**

```json
{
  "keywords": "software engineer",
  "location": "Remote",
  "experienceLevel": "Senior",
  "remote": true,
  "limit": 20
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "ext-1",
      "title": "Senior Software Engineer",
      "company": "External Corp",
      "location": "Remote",
      "description": "...",
      "salary": "$150k - $200k",
      "source": "linkedin",
      "applyUrl": "https://..."
    }
  ],
  "count": 15
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "error details"
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 30 requests per minute
- **Resume optimization**: 10 requests per minute

When rate limit is exceeded:

```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded. Max 10 requests per 60 seconds.",
  "retryAfter": 45
}
```

The `retryAfter` field indicates seconds to wait before retrying.

---

## Examples

### cURL Examples

**Optimize Resume:**

```bash
curl -X POST http://localhost:3001/api/resume/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {...},
    "jobDescription": {...},
    "style": "concise"
  }'
```

**Search Jobs:**

```bash
curl -X POST http://localhost:3001/api/jobs/search \
  -H "Content-Type: application/json" \
  -d '{"query": "backend", "workMode": "remote"}'
```

**Get All Jobs:**

```bash
curl http://localhost:3001/api/jobs
```

---

## Need Help?

For questions or issues:
- Check the [README.md](README.md) for setup instructions
- See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Open an issue on GitHub
