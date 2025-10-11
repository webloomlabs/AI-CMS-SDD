# Quickstart: AI-Native CMS MVP

**Date**: October 11, 2025

## Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

## Setup

1. Clone repo and checkout branch: `git checkout 002-produce-an-actionable`

2. Copy env: `cp .env.sample .env`
   - Set DATABASE_URL=postgresql://user:pass@localhost:5432/cms
   - Set JWT_SECRET=your-secret
   - Set AI_PROVIDER=stub (or openai, set AI_API_KEY)

3. Start Postgres: `docker run -d -p 5432:5432 -e POSTGRES_DB=cms -e POSTGRES_USER=user -e POSTGRES_PASSWORD=pass postgres:15`

4. Install backend: `cd backend && npm install`

5. Run migrations: `npx prisma migrate dev`

6. Seed: `npx prisma db seed`

7. Start backend: `npm run dev`

8. Install frontend: `cd ../frontend && npm install`

9. Start frontend: `npm run dev`

10. Open http://localhost:3000

## Development
- Backend: http://localhost:3001
- Frontend: http://localhost:3000
- API docs: Use contracts/api.yaml

## Testing
- Backend: `npm test`
- Frontend: `npm test`