# Tasks: AI-Native CMS MVP

**Input**: Design documents from `/specs/002-produce-an-actionable/`
**Prerequisit## Implementation Strategy

### MVP First (User Stories 1-4 - Backend Complete)

1. Complete Phase 1: Setup ✅
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories) ✅
3. Complete Phase 3: User Story 1 (Authentication) ✅
4. **VALIDATE**: Test User Story 1 independently ✅
5. Complete Phase 4: User Story 2 (Content CRUD) ✅
6. **VALIDATE**: Test User Story 2 independently ✅
7. Complete Phase 5: User Story 3 (Media Upload & Management) ✅
8. **VALIDATE**: Test User Story 3 independently ✅
9. Complete Phase 6: User Story 4 (AI Content Generation) ✅
10. **VALIDATE**: Test User Story 4 independently ✅
11. **BACKEND COMPLETE**: All 119 tests passing ✅

### Full Stack MVP (Add Frontend - Days 5-7)

12. Complete Phase 7: Frontend Setup & Login (Day 5)
13. **VALIDATE**: Login page working with backend auth
14. Complete Phase 8: Admin Dashboard UI (Day 6)
15. **VALIDATE**: Full admin dashboard functional
16. Complete Phase 9: Deployment & Polish (Day 7)
17. **END-TO-END TEST**: Complete user journey from login to publish
18. **DEMO READY**: Application deployed and ready for presentation

---red), spec.md (required for user stories), research.md, data-model.md, contracts/

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

- [x] T012 [P] [US1] Unit test for auth service in backend/tests/unit/auth.test.ts
- [x] T013 [P] [US1] Integration test for login endpoint in backend/tests/integration/auth.test.ts

### Implementation for User Story 1

- [x] T014 [US1] Create auth controller: POST /api/v1/auth/login in backend/src/controllers/auth.ts
- [x] T015 [US1] Wire auth controller to Express app in backend/src/index.ts
- [x] T016 [US1] Update .env.sample with DATABASE_URL, JWT_SECRET

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after User Story 1 (P1) - Requires authentication for content operations
- **User Story 3 (P3)**: Can start after User Story 2 (P2) - Requires content items to attach media to
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Independent of User Stories 2 and 3, only requires authentication

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

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup ✅
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories) ✅
3. Complete Phase 3: User Story 1 (Authentication) ✅
4. **VALIDATE**: Test User Story 1 independently ✅
5. Complete Phase 4: User Story 2 (Content CRUD)
6. **STOP and VALIDATE**: Test User Story 2 independently
7. Deploy/demo if ready

### Extended MVP (Add User Stories 3 & 4)

8. Complete User Story 3: Media Upload & Management
9. Complete User Story 4: AI Content Generation
10. Full integration testing
11. Production deployment

---

---

## Phase 4: User Story 2 - Content CRUD Operations (Priority: P2) 🎯 MVP

**Goal**: Enable editors to create, read, update, and delete content items with dynamic fields

**Independent Test**: Can be fully tested by performing CRUD operations on content items and verifying persistence and display

**Dependencies**: Requires Phase 2 (Foundational) and Phase 3 (US1 - Auth) to be complete

### Tests for User Story 2 ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T017 [P] [US2] Unit test for content service in backend/tests/unit/content.test.ts
- [x] T018 [P] [US2] Integration test for content endpoints in backend/tests/integration/content.test.ts

### Implementation for User Story 2

- [x] T019 [US2] Create content service for CRUD operations in backend/src/services/content.ts
- [x] T020 [US2] Implement content controller: GET/POST/PUT/DELETE /api/v1/content in backend/src/controllers/content.ts
- [x] T021 [US2] Add validation middleware for content in backend/src/middleware/validation.ts
- [x] T022 [US2] Wire content routes to Express app in backend/src/index.ts
- [x] T023 [US2] Seed default content type and sample content item in backend/prisma/seed.ts

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently

---

## Phase 5: User Story 3 - Media Upload and Management (Priority: P3) 🎯 MVP

**Goal**: Enable editors to upload media files, process images, and attach them to content items

**Independent Test**: Can be fully tested by uploading a file, verifying processing (width/height extraction), and attaching to content

**Dependencies**: Requires Phase 2 (Foundational), Phase 3 (US1 - Auth), and Phase 4 (US2 - Content) to be complete

### Tests for User Story 3 ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T024 [P] [US3] Unit test for storage provider in backend/tests/unit/storage.test.ts
- [x] T025 [P] [US3] Unit test for media service in backend/tests/unit/media.test.ts
- [x] T026 [P] [US3] Integration test for media endpoints in backend/tests/integration/media.test.ts

### Implementation for User Story 3

- [x] T027 [US3] Create storage provider interface in backend/src/utils/storage/StorageProvider.ts
- [x] T028 [US3] Implement LocalStorage provider with Sharp for image processing in backend/src/utils/storage/LocalStorage.ts
- [x] T029 [US3] Create media service for upload/list/delete operations in backend/src/services/media.ts
- [x] T030 [US3] Implement media controller: POST/GET/DELETE /api/v1/media in backend/src/controllers/media.ts
- [x] T031 [US3] Configure Multer middleware for file uploads in backend/src/middleware/upload.ts
- [x] T032 [US3] Wire media routes to Express app in backend/src/index.ts
- [x] T033 [US3] Update content endpoints to support media relations in backend/src/controllers/content.ts
- [x] T034 [US3] Create uploads directory and configure .gitignore in backend/uploads/
- [x] T035 [US3] Update .env.sample with UPLOAD_PATH and STORAGE_PROVIDER

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently

---

## Phase 6: User Story 4 - AI Content Generation (Priority: P4) 🎯 Extended MVP

**Goal**: Enable editors to use AI to generate content drafts, SEO metadata, or alt text to accelerate content creation

**Independent Test**: Can be fully tested by calling the AI generate endpoint with different modes and verifying responses (both with real AI provider and stub fallback)

**Dependencies**: Requires Phase 2 (Foundational) and Phase 3 (US1 - Auth) to be complete. Can run independently of Phase 4 and Phase 5.

### Tests for User Story 4 ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T036 [P] [US4] Unit test for AI service with stub provider in backend/tests/unit/ai.test.ts
- [x] T037 [P] [US4] Unit test for Gemini AI provider in backend/tests/unit/aiProviders.test.ts
- [x] T038 [P] [US4] Integration test for AI generate endpoint in backend/tests/integration/ai.test.ts

### Implementation for User Story 4

- [x] T039 [US4] Create AI provider interface in backend/src/utils/ai/AIProvider.ts
- [x] T040 [US4] Implement StubAIProvider for deterministic testing in backend/src/utils/ai/StubAIProvider.ts
- [x] T041 [US4] Implement GeminiAIProvider for Google Gemini integration in backend/src/utils/ai/GeminiAIProvider.ts
- [x] T042 [US4] Create AI service for generate operations with provider factory in backend/src/services/ai.ts
- [x] T043 [US4] Implement AI controller: POST /api/v1/ai/generate with mode support in backend/src/controllers/ai.ts
- [x] T044 [US4] Wire AI routes to Express app in backend/src/index.ts
- [x] T045 [US4] Update .env and .env.sample with AI_PROVIDER (default: gemini) and GEMINI_API_KEY

**Checkpoint**: At this point, User Story 4 should be fully functional and testable independently

---

## Phase 7: Frontend Setup & Login (Day 5)

**Goal**: Set up React frontend with TypeScript, Tailwind, and shadcn/ui, implement login page

**Independent Test**: Can be fully tested by running the frontend, submitting login form, and verifying authentication flow

**Dependencies**: Requires Phase 3 (US1 - Auth API) to be complete

### Frontend Initialization

- [X] T046 [P] Initialize frontend project with Create React App + TypeScript in frontend/
- [X] T047 [P] Install dependencies: react-router-dom, axios, tailwindcss, shadcn/ui in frontend/
- [X] T048 [P] Configure Tailwind CSS in frontend/tailwind.config.js
- [X] T049 [P] Set up shadcn/ui components library in frontend/
- [X] T050 [P] Create project structure: frontend/src/components/, frontend/src/pages/, frontend/src/services/, frontend/src/hooks/

### Authentication UI & State

- [X] T051 [P] Create API client service in frontend/src/services/api.ts with axios instance
- [X] T052 [P] Create auth service in frontend/src/services/auth.ts for login/logout/token management
- [X] T053 [P] Create auth context/hook in frontend/src/hooks/useAuth.tsx for state management
- [X] T054 Create Login page component in frontend/src/pages/Login.tsx with form validation
- [X] T055 [P] Create ProtectedRoute component in frontend/src/components/ProtectedRoute.tsx
- [X] T056 Set up React Router in frontend/src/App.tsx with login and protected routes
- [X] T057 [P] Create basic UI components: Button, Input, Card in frontend/src/components/ui/

### Testing & Styling

- [X] T058 [P] Write tests for Login component in frontend/tests/Login.test.tsx
- [X] T059 [P] Write tests for auth service in frontend/tests/auth.test.ts
- [X] T060 [P] Add responsive styling and layout in frontend/src/App.css
- [X] T061 [P] Update frontend .env.sample with REACT_APP_API_URL

**Checkpoint**: At this point, frontend should be set up with working login page

---

## Phase 8: Admin Dashboard UI (Day 6)

**Goal**: Implement content list, editor, media library pages for full admin experience

**Independent Test**: Can be fully tested by navigating through all pages, creating/editing content, uploading media

**Dependencies**: Requires Phase 7 (Frontend Setup), Phase 4 (Content API), Phase 5 (Media API), and Phase 6 (AI API)

### Content Management Pages

- [X] T062 Create Dashboard layout component in frontend/src/components/Layout.tsx with navigation
- [X] T063 Create ContentList page in frontend/src/pages/ContentList.tsx to display all content
- [X] T064 [P] Create content service in frontend/src/services/content.ts for CRUD operations
- [X] T065 Create ContentEditor page in frontend/src/pages/ContentEditor.tsx for create/edit
- [X] T066 [P] Add dynamic field rendering in ContentEditor based on content type
- [X] T067 [P] Create ContentCard component in frontend/src/components/ContentCard.tsx for list view

### Media Library

- [ ] T068 Create MediaLibrary modal component in frontend/src/components/MediaLibrary.tsx
- [ ] T069 [P] Create media service in frontend/src/services/media.ts for upload/list/delete
- [ ] T070 [P] Add drag-and-drop upload support in MediaLibrary component
- [ ] T071 [P] Create MediaGrid component in frontend/src/components/MediaGrid.tsx for displaying media
- [ ] T072 Implement media selection and attachment to content in ContentEditor

### AI Integration UI

- [ ] T073 [P] Create AI service in frontend/src/services/ai.ts for generate requests
- [ ] T074 [P] Add "Generate with AI" button in ContentEditor
- [ ] T075 [P] Create AIGenerateModal component in frontend/src/components/AIGenerateModal.tsx
- [ ] T076 Integrate AI generation into content workflow (draft, SEO, alt text)

### Polish & Testing

- [ ] T077 [P] Add loading states and error handling across all pages
- [ ] T078 [P] Implement toast notifications in frontend/src/components/Toast.tsx
- [ ] T079 [P] Add responsive design for mobile and tablet views
- [ ] T080 [P] Write component tests for ContentList, ContentEditor, MediaLibrary
- [ ] T081 [P] Add accessibility features (ARIA labels, keyboard navigation)

**Checkpoint**: At this point, full admin dashboard should be functional

---

## Phase 9: Deployment & Polish (Day 7)

**Goal**: Containerize application, document deployment, perform end-to-end testing

**Independent Test**: Can be fully tested by running docker-compose and performing complete user journey

**Dependencies**: Requires all previous phases to be complete

### Containerization

- [ ] T082 [P] Create Dockerfile for backend in backend/Dockerfile
- [ ] T083 [P] Create Dockerfile for frontend in frontend/Dockerfile
- [ ] T084 Create docker-compose.yml in project root with backend, frontend, and postgres services
- [ ] T085 [P] Create .dockerignore files for backend and frontend
- [ ] T086 [P] Add health check endpoints and container startup scripts

### Documentation

- [ ] T087 [P] Update README.md with complete setup instructions
- [ ] T088 [P] Add API documentation in docs/API.md
- [ ] T089 [P] Create deployment guide in docs/DEPLOYMENT.md
- [ ] T090 [P] Document environment variables in .env.sample files
- [ ] T091 [P] Add troubleshooting guide in docs/TROUBLESHOOTING.md

### Testing & Quality Assurance

- [ ] T092 [P] Run full test suite and ensure all tests pass (backend + frontend)
- [ ] T093 Perform end-to-end test: auth → create content → upload media → generate AI → publish
- [ ] T094 [P] Test application in different browsers (Chrome, Firefox, Safari)
- [ ] T095 [P] Verify mobile responsiveness on different screen sizes
- [ ] T096 [P] Run security audit (npm audit, check for vulnerabilities)
- [ ] T097 [P] Performance testing: verify API response times < 300ms

### Final Polish

- [ ] T098 [P] Fix any remaining bugs identified during testing
- [ ] T099 [P] Optimize bundle sizes and image assets
- [ ] T100 [P] Add production build scripts in package.json
- [ ] T101 [P] Create demo data seeding script
- [ ] T102 Prepare demo presentation script

**Checkpoint**: Application ready for deployment and demo

---

## User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational - BLOCKS ALL STORIES)
    ↓
    ├─→ Phase 3 (US1: Auth) ✅
    │       ↓
    │       ├─→ Phase 4 (US2: Content CRUD) ✅
    │       │
    │       ├─→ Phase 5 (US3: Media Upload) ✅
    │       │
    │       ├─→ Phase 6 (US4: AI Generation) ✅
    │       │
    │       └─→ Phase 7 (Frontend Login - Day 5)
    │               ↓
    │               └─→ Phase 8 (Admin Dashboard - Day 6)
    │
    └─→ Phase 9 (Deployment - Day 7)
```

**Critical Path**: Phase 1 → Phase 2 → Phase 3 → Phase 7 → Phase 8 → Phase 9

**Independent Streams**:
- Backend features (Phases 4, 5, 6) can be developed in parallel after Phase 3
- Frontend (Phases 7-8) requires Phase 3 (auth API) but can proceed while backend features are being developed

---

## Parallel Execution Opportunities

### Phase 7 (Frontend Setup)
- T046-T050: Project setup tasks (all parallel)
- T051-T053: Service layer tasks (all parallel)
- T057-T061: UI components and testing (all parallel)
- Sequential: T054 → T055 → T056 (depends on auth service)

### Phase 8 (Dashboard UI)
- T064, T069, T073: Service layer (all parallel)
- T067, T071, T075, T078: Reusable components (all parallel)
- T077-T081: Polish and testing (all parallel)
- Sequential: T062 → T063 → T065 → T066 → T072 → T074 → T076

### Phase 9 (Deployment)
- T082-T086: Docker setup (all parallel)
- T087-T091: Documentation (all parallel)
- T092, T094-T097: Testing and QA (all parallel)
- T098-T102: Final polish (all parallel)
- Sequential: T093 must run after T092

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Frontend (Phases 7-8) focuses on UI/UX and integrates with completed backend APIs
- Day 7 (Phase 9) is primarily integration, documentation, and deployment - no new features