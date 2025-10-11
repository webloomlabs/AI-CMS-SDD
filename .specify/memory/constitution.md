# Project Constitution — AI-Native CMS (MVP)

**Project name:** AI-Native CMS — MVP  
**Objective:** Deliver a working headless CMS (API + PostgreSQL) with a functional admin dashboard and AI-assisted content workflow within 7 days.

**Baseline design:** Node.js + TypeScript backend, Express, Prisma + PostgreSQL, Multer/Sharp media pipeline, optional S3/Cloudinary providers, JWT auth. (See technical overview for full media and architecture details.) :contentReference[oaicite:1]{index=1}

---

## 1. Mission & Scope

**Mission:** Ship a secure, minimal, and extensible headless CMS with:
- Content type + content item CRUD via REST API.
- Media management (file upload, thumbnails).
- Admin dashboard (basic users/roles, content editing UI).
- AI-assisted features (content drafts, SEO suggestions, alt-text generation) as workflow integrations rather than heavy ML training.

**MVP scope (must-have):**
- User authentication (JWT) + role-based permissions (admin, editor).
- Content type definition (one customizable content type, e.g., "Article"), and content item CRUD.
- Media upload endpoint + list + delete; basic local storage and Sharp image processing.
- Admin dashboard that supports login, list/create/edit/delete content, upload/select media for content.
- Minimal AI assistant endpoints: `POST /api/v1/ai/generate` that returns generated copy/alt-text via an LLM integration stub.
- Deployment ready Dockerfile + .env.sample.

**Out of scope (MVP NOT delivering):**
- Full multi-tenant, plugin ecosystems, advanced video processing, complex search, and production CDN configuration (only placeholders).

---

## 2. Guiding Principles

1. **Iterate small, ship fast.** Prioritize end-to-end flows: create content → upload media → publish.  
2. **API-first.** All dashboard operations must be doable through the public API.  
3. **Secure by default.** JWT auth, input validation, file signature checks for uploads.  
4. **Testable.** Each feature must have a minimal automated test or documented manual acceptance test.  
5. **Extensible.** Keep provider abstractions (storage, AI) with clear interfaces so advanced integrations can be added later.

---

## 3. Roles & Responsibilities

- **Product Lead / PO (you / Shakil):** Accept stories, verify acceptance criteria, demo MVP.  
- **Backend Dev:** Implement API, auth, Prisma models, media providers.  
- **Frontend Dev:** Admin dashboard (React + Tailwind + shadcn/ui), wire to API.  
- **QA / Tester:** Execute acceptance tests, report blocking bugs.  
- **Ops:** Containerize, produce `.env.sample`, simple deployment instructions.

(One person can cover multiple roles for a 7-day sprint.)

---

## 4. Acceptance Criteria (per feature)

Each item below must be verified before being marked done.

### Auth
- Users can register (seeded admin) and login returning a JWT valid for API.
- Permissions: admin can create users and assign `editor` role; editor can create/edit content but not manage users.

### Content Types & Items
- API endpoints exist for content types and content items (create, read, update, delete).
- Dashboard UI to create/edit/publish content items with title, slug, body, and featured image selection.

### Media
- `POST /api/v1/media/upload` accepts image(s) and returns storage URL + metadata.
- Uploaded images produce at least one thumbnail (e.g., 150×150) via Sharp.
- Files validated by size and magic number.

### AI Workflow
- `POST /api/v1/ai/generate` accepts `prompt, mode` and returns generated text (stubbed integration allowed with test responses).
- Admin UI offers a “Generate draft” button that fills content editor with AI output.

### Deployment
- Dockerfile builds the backend; `.env.sample` included.
- Basic run instructions in README. Start locally and use a local PostgreSQL.

---

## 5. Non-Functional Requirements

- Response times: Basic list endpoints < 300ms on local dev.
- Concurrent users: support basic multi-user editing (no real-time sync required).
- Security: sanitize input, validate files, use bcrypt for passwords.
- Maintainability: TypeScript strict mode, clear interfaces for storage/AI.

---

## 6. Definition of Done (DoD)

A story is done when:
1. All acceptance criteria listed are satisfied.
2. All new code is covered by at least unit or smoke tests (or has a documented manual test case).
3. PR merged with review and passes CI lint & build.
4. README updated with run / deploy steps and environment variables.
5. Demo: Functional end-to-end demo performed (login → create content → upload image → publish).

---

## 7. Risks & Mitigations

- **Time risk:** 7 days is tight — mitigate by focusing strictly on MVP features and using simple defaults (local storage, single content type).
- **AI integration complexity:** Use an LLM stub or an API key variable and default to a deterministic stub for offline dev.
- **File processing:** Keep Sharp usage minimal and test on sample images locally.

---

## 8. Sprint Governance

- Daily standup (5–10 minutes): progress + blockers.
- Use issues for each acceptance criterion.
- Merge strategy: feature branch → PR → review → merge.
- Minimum one PR review per feature.

---

## 9. Appendix: Key Interfaces & Configs

Refer to the technical overview for storage provider interfaces, DB schema for media tables, and API endpoint examples. :contentReference[oaicite:2]{index=2}
