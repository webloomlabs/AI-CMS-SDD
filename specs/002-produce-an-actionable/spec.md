# Feature Specification: AI-Native CMS MVP

**Feature Branch**: `002-produce-an-actionable`  
**Created**: October 11, 2025  
**Status**: Draft  
**Input**: User description: "produce an actionable specification, database schema, API routes, required environment variables, and a prioritized issue list to implement a one-week MVP for an AI-Native CMS. Use the following constraints and goals.

Context (baseline design):
- Node.js + TypeScript backend, Express.
- PostgreSQL with Prisma ORM.
- Multer for memory uploads, Sharp for image processing.
- Local storage provider by default; S3/Cloudinary optional via env.
- Admin dashboard: React + Tailwind + shadcn/ui (single-page admin).
- AI assistant: provide an integration stub endpoint; allow wiring to real LLM via env var.

Primary goals (MUST):
1. Implement JWT auth and role-based access (admin, editor).
2. Implement DB models: users, roles, content_types, content_items, content_fields, media_files, media_folders, media_transformations, content_media_relations (use the schema in the provided overview as starting point). :contentReference[oaicite:3]{index=3}
3. Implement API endpoints for content CRUD and media upload/list/delete.
4. Implement basic Admin Dashboard UI: login, content list, content editor, media library modal to upload/select images.
5. Implement AI generate endpoint: \`POST /api/v1/ai/generate\` with \`mode\` in {draft, seo, alt_text} and a stub fallback if no API key present.
6. Containerize backend with Dockerfile and include \`.env.sample\`.

Deliverables:
- Prisma schema file.
- Express controllers + services: auth, content, media, ai (stub), health-check.
- Storage provider interface and LocalStorage implementation (must process images with Sharp and return metadata including width/height).
- Minimal React admin app with pages: Login, ContentList, Editor, Media Library.
- README with run instructions 
- Prefer remote hosted Prostgres databse ( connection string provided )
- Issue list with prioritized tasks, labels, and acceptance criteria for each issue.

Output required from you (format):
1. JSON object: \`{ \"prismaSchema\": \"...\", \"apiRoutes\": [...], \"envVars\": [...], \"issues\": [...] }\`
2. A short \"how to use\" paragraph describing how the Spec Kit user should ingest these items into their repo.

Constraints:
- Keep the API RESTful and simple.
- Use clear naming and consistent field types.
- Prioritize the end-to-end flow: auth → create content → upload media → attach media → publish.
- Favor defaults enabling rapid local development (local storage, seeded admin).
- For AI, include \`AI_PROVIDER\` env var and default to \`stub\` if missing."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Authentication (Priority: P1)

As an admin or editor, I want to log in to the CMS admin dashboard so that I can manage content securely.

**Why this priority**: Authentication is the foundation for all other features, enabling secure access to the CMS.

**Independent Test**: Can be fully tested by attempting login with valid credentials and verifying access to the dashboard, delivering secure access to content management.

**Acceptance Scenarios**:

1. **Given** I have valid admin/editor credentials, **When** I submit the login form, **Then** I am authenticated with JWT and redirected to the admin dashboard.

2. **Given** I have invalid credentials, **When** I submit the login form, **Then** I see an error message and remain on the login page.

---

### User Story 2 - Content CRUD Operations (Priority: P2)

As an editor, I want to create, read, update, and delete content items so that I can manage website content effectively.

**Why this priority**: Core CMS functionality for content management.

**Independent Test**: Can be tested by performing CRUD operations on content items and verifying persistence and display.

**Acceptance Scenarios**:

1. **Given** I am logged in as an editor, **When** I create a new content item, **Then** it is saved to the database and appears in the content list.

2. **Given** I have an existing content item, **When** I update its fields, **Then** the changes are persisted.

3. **Given** I have a content item, **When** I delete it, **Then** it is removed from the database and no longer appears in the list.

---

### User Story 3 - Media Upload and Management (Priority: P3)

As an editor, I want to upload media files and attach them to content so that I can enrich content with images and other media.

**Why this priority**: Enhances content creation with visual elements.

**Independent Test**: Can be tested by uploading a file, verifying processing, and attaching to content.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I upload an image file, **Then** it is processed, stored, and metadata (width/height) is saved.

2. **Given** I have uploaded media, **When** I attach it to a content item, **Then** the relation is established and the media is associated with the content.

---

### User Story 4 - AI Content Generation (Priority: P4)

As an editor, I want to use AI to generate content drafts, SEO metadata, or alt text so that I can accelerate content creation.

**Why this priority**: Provides AI-native features to differentiate the CMS.

**Independent Test**: Can be tested by calling the AI generate endpoint and verifying the response.

**Acceptance Scenarios**:

1. **Given** AI provider is configured, **When** I request draft generation, **Then** AI-generated content is returned.

2. **Given** AI provider is not configured, **When** I request generation, **Then** a stub response is provided.

---

### Edge Cases

- What happens when uploading invalid file types? (reject with error)
- How does system handle concurrent content edits? (last save wins)
- What if AI generation fails? (return error or fallback)
- How to handle large media files? (size limits)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide JWT-based authentication for users with admin or editor roles.
- **FR-002**: System MUST enforce role-based access control, where admins have full access including user and role management, and editors have access to content and media management.
- **FR-003**: System MUST support CRUD operations on content items, including creation, listing, updating, and deletion.
- **FR-004**: System MUST allow upload, listing, and deletion of media files, with automatic processing for images to extract metadata.
- **FR-005**: System MUST provide an AI generation endpoint that accepts mode (draft, seo, alt_text) and returns generated content or stub response.
- **FR-006**: System MUST support attaching media to content items via relations.
- **FR-007**: System MUST provide a basic admin dashboard UI for login, content management, and media library.

### Key Entities

- **User**: Represents authenticated users of the CMS, with attributes like email, password hash, role.
- **Role**: Defines user permissions, with values admin and editor.
- **ContentType**: Defines the structure of content, with name and field definitions.
- **ContentItem**: Instance of content, belonging to a ContentType, with dynamic fields.
- **ContentField**: Represents a field in a ContentType, with name, type, and value in ContentItem.
- **MediaFile**: Represents uploaded media, with path, type, size, metadata.
- **MediaFolder**: Organizes media files into folders.
- **MediaTransformation**: Processed versions of media, like resized images.
- **ContentMediaRelation**: Links content items to media files.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can log in to the admin dashboard in under 30 seconds.
- **SC-002**: Content creation and publishing workflow completes in under 2 minutes.
- **SC-003**: Media upload and processing completes in under 1 minute.
- **SC-004**: AI generation requests return results in under 10 seconds.
- **SC-005**: The MVP is implemented and deployable within one week.
