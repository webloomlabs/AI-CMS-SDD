# Implementation Plan: AI-Native CMS MVP

**Branch**: `002-produce-an-actionable` | **Date**: October 11, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-produce-an-actionable/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deliver a working headless CMS with JWT auth, role-based access, content CRUD API, media upload/management, AI generate endpoint, and a React admin dashboard. Backend in Node.js/TypeScript with Express and Prisma, frontend in React/Tailwind/shadcn/ui. Use local storage by default, PostgreSQL, containerized with Docker.

## Technical Context

**Language/Version**: Node.js 18+ with TypeScript  
**Primary Dependencies**: Express, Prisma Client, Multer, Sharp, jsonwebtoken, bcrypt  
**Storage**: PostgreSQL with Prisma ORM  
**Testing**: Jest for unit tests, Supertest for API integration tests  
**Target Platform**: Docker container for backend, local development with Docker Compose  
**Project Type**: Web application (backend API + frontend admin dashboard)  
**Performance Goals**: Basic API endpoints <300ms response time  
**Constraints**: Secure (JWT auth, input validation), testable (unit + integration), extensible (provider interfaces)  
**Scale/Scope**: MVP supporting basic multi-user editing, single customizable content type

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Mission & Scope: Aligned - focusing on MVP must-haves, out-of-scope items excluded.
- Guiding Principles: API-first, secure by default, testable, extensible - all incorporated.
- Roles & Responsibilities: Single dev can cover backend/frontend/ops.
- Acceptance Criteria: Defined per feature, will be verified.
- Non-Functional Requirements: Response times, security, maintainability - planned.
- Definition of Done: PR reviews, tests, demo - will follow.
- Risks & Mitigations: Time risk mitigated by small scope, AI stub for offline dev.

All gates pass.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── models/          # Prisma generated types
│   ├── services/        # Business logic (auth, content, media, ai)
│   ├── controllers/     # Express route handlers
│   ├── middleware/      # Auth, validation
│   ├── utils/           # Helpers (storage providers)
│   └── index.ts         # App entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── tests/
│   ├── unit/
│   └── integration/
└── Dockerfile

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Login, ContentList, Editor, MediaLibrary
│   ├── services/        # API client
│   └── App.tsx          # Main app
├── public/
└── tests/

docker-compose.yml       # For local dev (Postgres + app)
.env.sample
README.md
```

**Structure Decision**: Web application structure with separate backend and frontend directories, following the constitution's API-first principle. Backend handles API and data, frontend consumes API.

## Complexity Tracking

No violations - sticking to single project type, standard dependencies.

## 7-Day Sprint Plan

### Assumptions
- Day 0: Repo scaffold created; branch protection disabled; CI runs `npm run build` and `npm test`.
- Local development uses Docker Compose (Postgres + app).
- Use the specification from `/specify` (prisma schema, endpoints, envs).
- Small team (1-3 people) or single dev working full-time.
- Changes small and mergeable each day.
- End-to-end flow working by end of Day 3.
- Graceful degrade: if AI API unavailable, use stubbed deterministic responses.

### Day-by-Day Task List

#### Day 1: Backend Setup & Auth
**Goal**: Set up backend project, implement JWT auth and role-based access. Time-box: 8 hours.

- [ ] Initialize backend project with Node.js, TypeScript, Express.
- [ ] Set up Prisma with PostgreSQL, create schema.prisma from spec.
- [ ] Implement User and Role models, seed admin user.
- [ ] Create auth service with JWT, bcrypt for passwords.
- [ ] Implement auth middleware for role-based access.
- [ ] Create auth controller: POST /api/v1/auth/login.
- [ ] Add health-check endpoint: GET /api/v1/health.
- [ ] Write unit tests for auth service.
- [ ] Update .env.sample with DATABASE_URL, JWT_SECRET.

**Deliverables**: Backend with auth API, seeded admin.
**Acceptance Tests**: Login with seeded admin returns JWT; invalid credentials fail; protected routes require JWT.

#### Day 2: Content CRUD API
**Goal**: Implement content types and items CRUD. Time-box: 8 hours.

- [ ] Implement ContentType and ContentItem models in Prisma.
- [ ] Create content service for CRUD operations.
- [ ] Implement content controller: GET/POST/PUT/DELETE /api/v1/content.
- [ ] Add dynamic fields support via ContentField.
- [ ] Implement validation middleware.
- [ ] Write integration tests for content endpoints.
- [ ] Seed a default content type (e.g., "Article").

**Deliverables**: Full content CRUD API.
**Acceptance Tests**: Create content item via API; list, update, delete; fields persist correctly.

#### Day 3: Media Upload & Management
**Goal**: Implement media upload, processing, and relations. Ensure end-to-end flow. Time-box: 8 hours.

- [ ] Implement MediaFile, MediaFolder, MediaTransformation models.
- [ ] Create storage provider interface, LocalStorage implementation.
- [ ] Integrate Multer for uploads, Sharp for image processing.
- [ ] Implement media controller: POST /api/v1/media/upload, GET /api/v1/media, DELETE /api/v1/media/:id.
- [ ] Add ContentMediaRelation for attaching media to content.
- [ ] Write tests for media upload and processing.
- [ ] Update content API to include media relations.

**Deliverables**: Media upload API with image processing.
**Acceptance Tests**: Upload image, verify metadata (width/height); attach to content; end-to-end: auth → create content → upload media → attach.

#### Day 4: AI Generate Endpoint
**Goal**: Implement AI generate with stub fallback. Time-box: 6 hours.

- [ ] Create AI service with provider interface (stub by default).
- [ ] Implement ai controller: POST /api/v1/ai/generate with mode support.
- [ ] Add graceful degrade: if AI_PROVIDER not set or API fails, return deterministic stub.
- [ ] Write tests for AI endpoint.
- [ ] Update .env.sample with AI_PROVIDER, AI_API_KEY.

**Deliverables**: AI generate endpoint.
**Acceptance Tests**: Call generate with mode=draft, receive response; test stub fallback.

#### Day 5: Frontend Setup & Login
**Goal**: Set up React frontend, implement login page. Time-box: 8 hours.

- [ ] Initialize frontend with React, TypeScript, Tailwind, shadcn/ui.
- [ ] Create API client service.
- [ ] Implement Login page with form.
- [ ] Add routing and auth state management.
- [ ] Connect to backend auth API.
- [ ] Write basic tests for login component.

**Deliverables**: Frontend with login page.
**Acceptance Tests**: Login form submits, authenticates, redirects to dashboard.

#### Day 6: Admin Dashboard UI
**Goal**: Implement content list, editor, media library. Time-box: 8 hours.

- [ ] Create ContentList page: list content items.
- [ ] Create Editor page: create/edit content with media attachment.
- [ ] Create MediaLibrary modal: upload/select images.
- [ ] Integrate with backend APIs.
- [ ] Add basic styling and responsiveness.
- [ ] Write component tests.

**Deliverables**: Full admin UI.
**Acceptance Tests**: List content; create/edit with media; upload/select images.

#### Day 7: Deployment & Polish
**Goal**: Containerize, document, test release. Time-box: 6 hours.

- [ ] Create Dockerfile for backend.
- [ ] Set up docker-compose.yml for local dev.
- [ ] Update README with run instructions.
- [ ] Final integration tests.
- [ ] Polish UI, fix bugs.
- [ ] Prepare for demo.

**Deliverables**: Deployable MVP.
**Acceptance Tests**: Full end-to-end demo: login → create content → upload media → generate AI → publish.

### PR Template

**PR Title**: [Feature] Brief description

**Description**:
- What: [What was implemented]
- Why: [Why this change]
- How: [Key technical details]

**Acceptance Criteria**:
- [ ] Criteria 1
- [ ] Criteria 2

**Testing**:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual QA: [Steps]

**Screenshots/Logs**: [If applicable]

**Checklist**:
- [ ] Code reviewed
- [ ] CI passes
- [ ] README updated
- [ ] No breaking changes

### QA/Test Checklist for Release

- [ ] Auth: Login/logout works, roles enforced
- [ ] Content: CRUD operations functional
- [ ] Media: Upload, process, attach works
- [ ] AI: Generate endpoint returns responses
- [ ] UI: All pages load, forms submit
- [ ] Performance: Endpoints <300ms
- [ ] Security: No vulnerabilities, input sanitized
- [ ] Cross-browser: Works in Chrome/Firefox
- [ ] Mobile: Responsive design
- [ ] Accessibility: Basic WCAG compliance

### Demo Script

1. Start app: `docker-compose up`
2. Open http://localhost:3000
3. Login with seeded admin (email: admin@example.com, password: admin123)
4. Navigate to Content List
5. Click "New Content"
6. Fill title, body; upload image via Media Library
7. Click "Generate Draft" to use AI
8. Save and publish
9. Verify content appears in list with media

### Rollback / Debugging Steps

- Rollback: `git revert <commit>` or redeploy previous image
- Debug: Check logs `docker-compose logs`
- Common issues: DB connection (check DATABASE_URL), AI API (check keys), file permissions (for uploads)
- Health check: GET /api/v1/health
