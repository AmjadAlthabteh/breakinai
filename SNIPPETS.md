# Code Snippets

## Short Snippets

### Parse a job search query
```ts
const normalizeQuery = (input: string) =>
  input.trim().toLowerCase().split(/\s+/).slice(0, 6);
```

### Build a safe API URL
```ts
const apiUrl = (path: string) => new URL(path, window.location.origin).toString();
```

### Quick client-side cache
```ts
const cache = new Map<string, unknown>();
const cached = <T>(key: string, loader: () => T): T => {
  if (!cache.has(key)) cache.set(key, loader());
  return cache.get(key) as T;
};
```

## Bad Snippets (Avoid These)

### Hardcoded API host
```ts
fetch("http://localhost:3001/api/jobs");
```

### Silent error swallowing
```ts
try {
  await fetch("/api/jobs");
} catch (_) {}
```

## Update Snippet

### Update a job listing in memory
```ts
type Job = { id: string; title: string; score: number };
const updateJob = (jobs: Job[], next: Job) =>
  jobs.map((job) => (job.id === next.id ? { ...job, ...next } : job));
```
