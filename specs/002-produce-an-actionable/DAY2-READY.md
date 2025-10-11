# Day 2 Tasks Created ✅

**Date**: October 11, 2025  
**Status**: Ready to Start  
**Feature**: Content CRUD API (User Story 2, Priority P2)

## Summary

Successfully generated comprehensive task breakdown for Day 2 implementation following the same TDD methodology used in Day 1.

## Tasks Generated

### Added to `tasks.md`
- **Phase 4: User Story 2 - Content CRUD Operations**
- 7 tasks (T017-T023) with clear dependencies and parallel execution opportunities
- Updated execution order and implementation strategy
- Marked Day 1 tasks as complete (T001-T016 ✅)

### Detailed Guide Created
- **File**: `DAY2-TASKS.md`
- Complete implementation guide with code samples
- Test-first approach (RED → GREEN → REFACTOR)
- Acceptance criteria for each task
- Manual testing commands
- Troubleshooting section

## Task Breakdown (T017-T023)

| Task | Type | File | Description | Time |
|------|------|------|-------------|------|
| T017 | Test | `backend/tests/unit/content.test.ts` | Unit tests for content service | 1h |
| T018 | Test | `backend/tests/integration/content.test.ts` | Integration tests for endpoints | 1.5h |
| T019 | Service | `backend/src/services/content.ts` | Content CRUD business logic | 1.5h |
| T020 | Controller | `backend/src/controllers/content.ts` | Content API endpoints | 1.5h |
| T021 | Middleware | `backend/src/middleware/validation.ts` | Validation rules | 1h |
| T022 | Routes | `backend/src/index.ts` | Wire content routes | 0.5h |
| T023 | Data | `backend/prisma/seed.ts` | Seed sample content | 1h |

**Total Time Budget**: 8 hours

## Implementation Strategy

### TDD Approach (Same as Day 1)

1. **RED Phase** - Write failing tests first:
   - T017: Unit tests (should FAIL ❌)
   - T018: Integration tests (should FAIL ❌)

2. **GREEN Phase** - Make tests pass:
   - T019: Content service implementation
   - T020: Content controller implementation
   - T021: Validation middleware
   - All tests should PASS ✅

3. **Integration Phase**:
   - T022: Wire routes to Express
   - T023: Seed sample data

4. **Validation Phase**:
   - Manual testing with curl
   - End-to-end verification

## Key Features

### Content Service (`T019`)
- `createContent()` - Create content with dynamic fields
- `getContent()` - Get single content item with fields
- `listContent()` - List with filters (contentTypeId, status)
- `updateContent()` - Update content and replace fields
- `deleteContent()` - Delete content and cascade fields
- `generateSlug()` - Auto-generate unique slug from title

### Content Controller (`T020`)
- `POST /api/v1/content` - Create new content (requires editor role)
- `GET /api/v1/content` - List all content with filters
- `GET /api/v1/content/:id` - Get single content item
- `PUT /api/v1/content/:id` - Update content (requires editor role)
- `DELETE /api/v1/content/:id` - Delete content (requires editor role)

### Validation (`T021`)
- Express-validator rules
- Required fields: contentTypeId, title, status
- Field validation: name, type, value
- Query parameter validation

## Database Schema (Already Complete ✅)

The following models are already in `backend/prisma/schema.prisma`:

```prisma
model ContentType {
  id     Int            @id @default(autoincrement())
  name   String         @unique
  items  ContentItem[]
  fields ContentField[]
}

model ContentItem {
  id            Int                    @id @default(autoincrement())
  contentTypeId Int
  contentType   ContentType            @relation(fields: [contentTypeId], references: [id])
  title         String
  slug          String                 @unique
  status        String
  createdAt     DateTime               @default(now())
  updatedAt     DateTime               @updatedAt
  fields        ContentField[]
  media         ContentMediaRelation[]
}

model ContentField {
  id            Int          @id @default(autoincrement())
  contentTypeId Int?
  contentType   ContentType? @relation(fields: [contentTypeId], references: [id])
  contentItemId Int?
  contentItem   ContentItem? @relation(fields: [contentItemId], references: [id], onDelete: Cascade)
  name          String
  type          String
  value         String
}
```

## Prerequisites (All Complete ✅)

- [x] Backend project structure
- [x] TypeScript configuration
- [x] Prisma schema with content models
- [x] Database migrated
- [x] Authentication system (JWT)
- [x] Role-based middleware
- [x] Express server running

## Acceptance Tests

After Day 2 completion, verify:

### Create Content ✓
- Can create content with title, slug, status
- Can add dynamic fields
- Auto-generates slug if not provided
- Validates required fields

### List Content ✓
- Returns all content items
- Can filter by contentTypeId
- Can filter by status (draft/published)

### Get Content ✓
- Returns content by ID with fields
- Returns 404 for non-existent content

### Update Content ✓
- Can update title, slug, status
- Can update fields (add/remove/modify)

### Delete Content ✓
- Can delete content
- Cascades delete to fields

### Security ✓
- Requires authentication (JWT)
- Requires editor or admin role for mutations
- Validates all inputs

## Next Steps

### Start Day 2 Implementation

```bash
# 1. Review the tasks
cat specs/002-produce-an-actionable/DAY2-TASKS.md

# 2. Start with T017 (Unit Tests)
# Create backend/tests/unit/content.test.ts
# Ensure tests FAIL before implementation

# 3. Continue with T018 (Integration Tests)
# Create backend/tests/integration/content.test.ts
# Ensure tests FAIL before implementation

# 4. Implement T019 (Service)
# Create backend/src/services/content.ts
# Make unit tests PASS

# 5. Continue through T020-T023
# Follow the detailed guide in DAY2-TASKS.md
```

### Resources
- **Main Task List**: `specs/002-produce-an-actionable/tasks.md`
- **Detailed Guide**: `specs/002-produce-an-actionable/DAY2-TASKS.md`
- **Spec Reference**: `specs/002-produce-an-actionable/spec.md` (User Story 2)
- **Data Model**: `specs/002-produce-an-actionable/data-model.md`
- **API Contracts**: `specs/002-produce-an-actionable/contracts/api.yaml`

## Success Criteria

Day 2 is complete when all of the following are true:

- [ ] All 7 tasks (T017-T023) completed and marked in `tasks.md`
- [ ] All tests passing (`npm test`)
- [ ] Server runs without errors (`npm run dev`)
- [ ] Content CRUD operations work via API
- [ ] Manual testing with curl successful
- [ ] Database seeded with sample content
- [ ] Ready to proceed to Day 3 (Media Upload & Management)

---

## Files Modified

1. **specs/002-produce-an-actionable/tasks.md**
   - Added Phase 4: User Story 2 (T017-T023)
   - Updated dependencies and execution order
   - Marked Day 1 tasks as complete

2. **specs/002-produce-an-actionable/DAY2-TASKS.md** (NEW)
   - Comprehensive implementation guide
   - Complete code samples for all tasks
   - Testing strategy and manual test commands
   - Troubleshooting section

3. **specs/002-produce-an-actionable/DAY2-READY.md** (NEW - this file)
   - Summary of Day 2 tasks
   - Quick reference guide

---

**Status**: ✅ Day 2 tasks ready to implement  
**Estimated Time**: 8 hours  
**Approach**: TDD (Test-Driven Development)  
**Next Action**: Begin T017 (Unit Tests for Content Service)
