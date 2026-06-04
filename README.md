# LexiClass Frontend

Next.js frontend for LexiClass, a web system for teacher-led vocabulary practice.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Playwright
- pnpm

## Local Setup

Install dependencies:

```powershell
pnpm install
```

Create `.env.local` from `.env.example`:

```powershell
Copy-Item .env.example .env.local
```

The default `.env.example` keeps the frontend in mock mode:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_DATA_SOURCE=mock
```

To test against the backend, set:

```text
NEXT_PUBLIC_DATA_SOURCE=backend
```

## Running Locally

Development server:

```powershell
pnpm dev
```

Open:

```text
http://localhost:3000
```

Production start requires a build first:

```powershell
pnpm build
pnpm start
```

## Backend Mode

Backend mode expects:

- backend API at `http://localhost:4000/api/v1`
- backend database migrated and seeded
- demo users available:

```text
teacher@example.com / password
student@example.com / password
```

Typical full-stack startup:

```powershell
cd ..\lexiclass-backend
docker compose up -d
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

Then in another terminal:

```powershell
cd ..\lexiclass-frontend
pnpm dev
```

## Useful Routes

```text
/login
/register
/teacher/dashboard
/teacher/classes
/teacher/word-sets
/teacher/analytics
/student/dashboard
/student/progress
```

## Verification

Run static and unit checks:

```powershell
pnpm lint
pnpm exec tsc --noEmit
pnpm test
```

Run browser flow tests:

```powershell
pnpm test:e2e
```

The E2E config starts or reuses the frontend on `http://localhost:3000` and defaults to backend mode. Make sure the backend is already running on `http://localhost:4000`.

For interactive Playwright debugging:

```powershell
pnpm test:e2e:ui
```

## Data Source Modes

`NEXT_PUBLIC_DATA_SOURCE=mock`:

- uses in-browser mock services
- works without the backend
- useful for UI demos and isolated frontend checks

`NEXT_PUBLIC_DATA_SOURCE=backend`:

- uses the NestJS API
- stores auth tokens in browser storage
- exercises real class, word-set, assignment, practice, progress, and analytics flows

## API Contract

The frontend service boundary is documented in:

```text
docs/api-contracts.md
```
