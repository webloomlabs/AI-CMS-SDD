# Tasks: AI-Native CMS MVP

**Input**: Design documents from `/specs/002-produce-an-actionable/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included as requested in the sprint plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Backend: `backend/src/`, `backend/tests/`
- Frontend: `frontend/src/`, `frontend/tests/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure per plan.md (backend/src/, backend/prisma/, backend/tests/)
- [x] T002 Initialize Node.js project with package.json in backend/
- [x] T003 Install dependencies: express, prisma, jsonwebtoken, bcrypt, etc. in backend/
- [x] T004 Set up TypeScript configuration in backend/tsconfig.json
- [x] T005 [P] Configure linting and formatting tools (ESLint, Prettier)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Setup Prisma with PostgreSQL schema in backend/prisma/schema.prisma
- [x] T007 Implement User and Role models in backend/prisma/schema.prisma
- [x] T008 Create database migration and seed admin user
- [x] T009 Implement auth service with JWT and bcrypt in backend/src/services/auth.ts
- [x] T010 Implement auth middleware for role-based access in backend/src/middleware/auth.ts
- [x] T011 Create health-check endpoint in backend/src/controllers/health.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Admin Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable admin and editor users to log in securely to the CMS admin dashboard

**Independent Test**: Can be fully tested by attempting login with valid credentials and verifying JWT token and dashboard access

### Tests for User Story 1 ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Unit test for auth service in backend/tests/unit/auth.test.ts
- [ ] T013 [P] [US1] Integration test for login endpoint in backend/tests/integration/auth.test.ts

### Implementation for User Story 1

- [ ] T014 [US1] Create auth controller: POST /api/v1/auth/login in backend/src/controllers/auth.ts
- [ ] T015 [US1] Wire auth controller to Express app in backend/src/index.ts
- [ ] T016 [US1] Update .env.sample with DATABASE_URL, JWT_SECRET

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Services before controllers
- Controllers before wiring to app
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks can run sequentially (database setup first)
- Once Foundational phase completes, User Story 1 can start
- Tests for US1 marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for auth service in backend/tests/unit/auth.test.ts"
Task: "Integration test for login endpoint in backend/tests/integration/auth.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence