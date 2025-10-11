# Day 2 Implementation Guide: Content CRUD API

**Date**: October 11, 2025  
**Feature**: User Story 2 - Content CRUD Operations (Priority P2)  
**Goal**: Enable editors to create, read, update, and delete content items with dynamic fields  
**Time Budget**: 8 hours

## Prerequisites ✅

Before starting Day 2, ensure these are complete:

- [x] Phase 1: Setup (T001-T005) - Backend structure, dependencies, TypeScript
- [x] Phase 2: Foundational (T006-T011) - Database schema, auth service, middleware
- [x] Phase 3: User Story 1 (T012-T016) - Authentication working with JWT tokens
- [x] Database migrated with ContentType, ContentItem, ContentField models
- [x] Server running and accessible at http://localhost:3001

## Task Overview

| ID | Type | File | Description | Est. Time |
|---|---|---|---|---|
| T017 | Test | `backend/tests/unit/content.test.ts` | Unit tests for content service | 1h |
| T018 | Test | `backend/tests/integration/content.test.ts` | Integration tests for content endpoints | 1.5h |
| T019 | Service | `backend/src/services/content.ts` | Content CRUD business logic | 1.5h |
| T020 | Controller | `backend/src/controllers/content.ts` | Content API endpoints | 1.5h |
| T021 | Middleware | `backend/src/middleware/validation.ts` | Content validation rules | 1h |
| T022 | Routes | `backend/src/index.ts` | Wire content routes to Express | 0.5h |
| T023 | Data | `backend/prisma/seed.ts` | Seed sample content | 1h |

**Total Estimated Time**: 8 hours

---

## Task T017: Unit Tests for Content Service

**Type**: Test (Unit)  
**File**: `backend/tests/unit/content.test.ts`  
**Status**: [ ] Not Started  
**Dependencies**: None (can start immediately)

### Objective
Create comprehensive unit tests for the content service CRUD operations with mocked database.

### Implementation Details

```typescript
// backend/tests/unit/content.test.ts
import { ContentService } from '../../src/services/content';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    contentItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    contentField: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
  })),
}));

describe('ContentService', () => {
  let contentService: ContentService;
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    contentService = new ContentService(prisma);
    jest.clearAllMocks();
  });

  describe('createContent', () => {
    it('should create content item with fields', async () => {
      // Test creating content with dynamic fields
    });

    it('should validate required fields', async () => {
      // Test validation
    });

    it('should generate unique slug', async () => {
      // Test slug generation
    });
  });

  describe('getContent', () => {
    it('should return content by id with fields', async () => {
      // Test retrieval
    });

    it('should return null for non-existent content', async () => {
      // Test not found
    });
  });

  describe('listContent', () => {
    it('should return all content items', async () => {
      // Test listing
    });

    it('should filter by contentTypeId', async () => {
      // Test filtering
    });

    it('should filter by status', async () => {
      // Test status filtering
    });
  });

  describe('updateContent', () => {
    it('should update content fields', async () => {
      // Test updating
    });

    it('should handle field additions and deletions', async () => {
      // Test field changes
    });
  });

  describe('deleteContent', () => {
    it('should delete content and associated fields', async () => {
      // Test deletion
    });
  });
});
```

### Acceptance Criteria
- [ ] All CRUD operations have unit tests
- [ ] Tests use mocked Prisma client
- [ ] Edge cases covered (not found, validation errors)
- [ ] Tests fail before implementation (RED phase)

### Verification Command
```bash
cd backend && npm test -- content.test.ts
```

---

## Task T018: Integration Tests for Content Endpoints

**Type**: Test (Integration)  
**File**: `backend/tests/integration/content.test.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T017 (can run in parallel)

### Objective
Test content API endpoints end-to-end with real database and authentication.

### Implementation Details

```typescript
// backend/tests/integration/content.test.ts
import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Content API', () => {
  let authToken: string;
  let contentTypeId: number;
  let contentItemId: number;

  beforeAll(async () => {
    // Login to get JWT token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    authToken = loginRes.body.token;

    // Get or create Article content type
    const contentType = await prisma.contentType.findUnique({
      where: { name: 'Article' }
    });
    contentTypeId = contentType!.id;
  });

  afterAll(async () => {
    // Cleanup test content
    await prisma.contentItem.deleteMany({
      where: { title: { contains: 'Test Article' } }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/content', () => {
    it('should create content item with fields', async () => {
      const res = await request(app)
        .post('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentTypeId,
          title: 'Test Article',
          slug: 'test-article',
          status: 'draft',
          fields: [
            { name: 'body', type: 'rich_text', value: 'Content here' },
            { name: 'excerpt', type: 'text', value: 'Short excerpt' }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Test Article');
      expect(res.body.fields).toHaveLength(2);
      contentItemId = res.body.id;
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/content')
        .send({ title: 'Test' });

      expect(res.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' }); // Missing required fields

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/content', () => {
    it('should list all content items', async () => {
      const res = await request(app)
        .get('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter by contentTypeId', async () => {
      const res = await request(app)
        .get(`/api/v1/content?contentTypeId=${contentTypeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.forEach((item: any) => {
        expect(item.contentTypeId).toBe(contentTypeId);
      });
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/v1/content?status=draft')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.forEach((item: any) => {
        expect(item.status).toBe('draft');
      });
    });
  });

  describe('GET /api/v1/content/:id', () => {
    it('should get content by id with fields', async () => {
      const res = await request(app)
        .get(`/api/v1/content/${contentItemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(contentItemId);
      expect(res.body).toHaveProperty('fields');
    });

    it('should return 404 for non-existent content', async () => {
      const res = await request(app)
        .get('/api/v1/content/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/content/:id', () => {
    it('should update content item', async () => {
      const res = await request(app)
        .put(`/api/v1/content/${contentItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Test Article',
          status: 'published',
          fields: [
            { name: 'body', type: 'rich_text', value: 'Updated content' }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Test Article');
      expect(res.body.status).toBe('published');
    });
  });

  describe('DELETE /api/v1/content/:id', () => {
    it('should delete content item', async () => {
      const res = await request(app)
        .delete(`/api/v1/content/${contentItemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      // Verify deletion
      const getRes = await request(app)
        .get(`/api/v1/content/${contentItemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });

    it('should require admin role to delete', async () => {
      // TODO: Test with editor role
    });
  });
});
```

### Acceptance Criteria
- [ ] All HTTP methods tested (GET, POST, PUT, DELETE)
- [ ] Authentication and authorization tested
- [ ] Validation errors tested
- [ ] Database interactions work correctly
- [ ] Tests fail before implementation (RED phase)

### Verification Command
```bash
cd backend && npm test -- integration/content.test.ts
```

---

## Task T019: Content Service Implementation

**Type**: Service  
**File**: `backend/src/services/content.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T017, T018 (tests must fail first)

### Objective
Implement business logic for content CRUD operations with dynamic fields support.

### Implementation Details

```typescript
// backend/src/services/content.ts
import { PrismaClient, ContentItem, ContentField } from '@prisma/client';

export interface ContentWithFields extends ContentItem {
  fields: ContentField[];
}

export interface CreateContentInput {
  contentTypeId: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  fields: Array<{
    name: string;
    type: string;
    value: string;
  }>;
}

export interface UpdateContentInput {
  title?: string;
  slug?: string;
  status?: 'draft' | 'published';
  fields?: Array<{
    name: string;
    type: string;
    value: string;
  }>;
}

export class ContentService {
  constructor(private prisma: PrismaClient) {}

  async createContent(input: CreateContentInput): Promise<ContentWithFields> {
    const { fields, ...contentData } = input;

    // Create content item with fields in a transaction
    const content = await this.prisma.contentItem.create({
      data: {
        ...contentData,
        fields: {
          create: fields.map(field => ({
            ...field,
            contentTypeId: input.contentTypeId,
          })),
        },
      },
      include: {
        fields: true,
        contentType: true,
      },
    });

    return content;
  }

  async getContent(id: number): Promise<ContentWithFields | null> {
    return this.prisma.contentItem.findUnique({
      where: { id },
      include: {
        fields: true,
        contentType: true,
        media: {
          include: {
            media: true,
          },
        },
      },
    });
  }

  async listContent(filters?: {
    contentTypeId?: number;
    status?: 'draft' | 'published';
  }): Promise<ContentWithFields[]> {
    return this.prisma.contentItem.findMany({
      where: filters,
      include: {
        fields: true,
        contentType: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async updateContent(
    id: number,
    input: UpdateContentInput
  ): Promise<ContentWithFields> {
    const { fields, ...contentData } = input;

    // Update in transaction
    return this.prisma.$transaction(async (tx) => {
      // Update content item
      const content = await tx.contentItem.update({
        where: { id },
        data: contentData,
      });

      // If fields provided, replace them
      if (fields) {
        // Delete existing fields
        await tx.contentField.deleteMany({
          where: { contentItemId: id },
        });

        // Create new fields
        await tx.contentField.createMany({
          data: fields.map(field => ({
            ...field,
            contentItemId: id,
            contentTypeId: content.contentTypeId,
          })),
        });
      }

      // Return updated content with fields
      return tx.contentItem.findUnique({
        where: { id },
        include: {
          fields: true,
          contentType: true,
        },
      }) as Promise<ContentWithFields>;
    });
  }

  async deleteContent(id: number): Promise<void> {
    // Cascade delete handled by Prisma schema
    await this.prisma.contentItem.delete({
      where: { id },
    });
  }

  async generateSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check for uniqueness
    const existing = await this.prisma.contentItem.findUnique({
      where: { slug: baseSlug },
    });

    if (!existing) {
      return baseSlug;
    }

    // Append number if duplicate
    let counter = 1;
    let slug = `${baseSlug}-${counter}`;
    while (await this.prisma.contentItem.findUnique({ where: { slug } })) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }
}
```

### Acceptance Criteria
- [ ] All CRUD operations implemented
- [ ] Dynamic fields support (create, update, delete)
- [ ] Slug generation with uniqueness check
- [ ] Transaction support for data integrity
- [ ] All unit tests pass (GREEN phase)

### Verification Command
```bash
cd backend && npm test -- unit/content.test.ts
```

---

## Task T020: Content Controller Implementation

**Type**: Controller  
**File**: `backend/src/controllers/content.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T019 (service must exist)

### Objective
Implement Express route handlers for content CRUD operations.

### Implementation Details

```typescript
// backend/src/controllers/content.ts
import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ContentService } from '../services/content';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const contentService = new ContentService(prisma);

// Validation rules
export const createContentValidation = [
  body('contentTypeId').isInt().withMessage('Content type ID must be an integer'),
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('slug').optional().trim(),
  body('status').isIn(['draft', 'published']).withMessage('Status must be draft or published'),
  body('fields').isArray().withMessage('Fields must be an array'),
  body('fields.*.name').notEmpty().withMessage('Field name is required'),
  body('fields.*.type').notEmpty().withMessage('Field type is required'),
  body('fields.*.value').exists().withMessage('Field value is required'),
];

export const updateContentValidation = [
  param('id').isInt().withMessage('Content ID must be an integer'),
  body('title').optional().trim(),
  body('slug').optional().trim(),
  body('status').optional().isIn(['draft', 'published']),
  body('fields').optional().isArray(),
];

export const getContentValidation = [
  param('id').isInt().withMessage('Content ID must be an integer'),
];

export const listContentValidation = [
  query('contentTypeId').optional().isInt(),
  query('status').optional().isIn(['draft', 'published']),
];

// Controllers
export const createContent = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { slug, ...input } = req.body;

    // Generate slug if not provided
    const finalSlug = slug || await contentService.generateSlug(input.title);

    const content = await contentService.createContent({
      ...input,
      slug: finalSlug,
    });

    res.status(201).json(content);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
};

export const getContent = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = parseInt(req.params.id);
    const content = await contentService.getContent(id);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to get content' });
  }
};

export const listContent = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const filters: any = {};

    if (req.query.contentTypeId) {
      filters.contentTypeId = parseInt(req.query.contentTypeId as string);
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    const content = await contentService.listContent(filters);
    res.json(content);
  } catch (error) {
    console.error('List content error:', error);
    res.status(500).json({ error: 'Failed to list content' });
  }
};

export const updateContent = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = parseInt(req.params.id);
    const content = await contentService.updateContent(id, req.body);

    res.json(content);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = parseInt(req.params.id);
    await contentService.deleteContent(id);

    res.status(204).send();
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
};
```

### Acceptance Criteria
- [ ] All CRUD endpoints implemented (GET, POST, PUT, DELETE)
- [ ] Validation middleware applied
- [ ] Error handling with proper status codes
- [ ] Integration tests pass (GREEN phase)

### Verification Command
```bash
cd backend && npm test -- integration/content.test.ts
```

---

## Task T021: Content Validation Middleware

**Type**: Middleware  
**File**: `backend/src/middleware/validation.ts`  
**Status**: [ ] Not Started  
**Dependencies**: None

### Objective
Create reusable validation middleware for content operations.

### Implementation Details

```typescript
// backend/src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateContentType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Validate that contentTypeId exists
  // This can be extended later
  next();
};
```

### Acceptance Criteria
- [ ] Validation middleware created
- [ ] Reusable across controllers
- [ ] Proper error response format

### Verification Command
```bash
cd backend && npm run build
```

---

## Task T022: Wire Content Routes to Express

**Type**: Routes  
**File**: `backend/src/index.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T020 (controller must exist)

### Objective
Add content routes to Express app with authentication middleware.

### Implementation Details

```typescript
// Add to backend/src/index.ts after auth routes

import {
  createContent,
  getContent,
  listContent,
  updateContent,
  deleteContent,
  createContentValidation,
  updateContentValidation,
  getContentValidation,
  listContentValidation,
} from './controllers/content';
import { authenticateToken, requireEditor } from './middleware/auth';

// Content routes - all require authentication
app.post(
  '/api/v1/content',
  authenticateToken,
  requireEditor,
  createContentValidation,
  createContent
);

app.get(
  '/api/v1/content',
  authenticateToken,
  listContentValidation,
  listContent
);

app.get(
  '/api/v1/content/:id',
  authenticateToken,
  getContentValidation,
  getContent
);

app.put(
  '/api/v1/content/:id',
  authenticateToken,
  requireEditor,
  updateContentValidation,
  updateContent
);

app.delete(
  '/api/v1/content/:id',
  authenticateToken,
  requireEditor,
  deleteContent
);
```

### Acceptance Criteria
- [ ] All content routes wired to Express
- [ ] Authentication middleware applied
- [ ] Editor role required for create/update/delete
- [ ] All routes accessible via HTTP

### Verification Command
```bash
cd backend && npm run dev
# Then test with curl or integration tests
```

---

## Task T023: Seed Sample Content

**Type**: Data  
**File**: `backend/prisma/seed.ts`  
**Status**: [ ] Not Started  
**Dependencies**: None

### Objective
Add sample content items to the database for testing and development.

### Implementation Details

```typescript
// Add to backend/prisma/seed.ts after existing seed code

  // Create sample content items
  const articleType = await prisma.contentType.findUnique({
    where: { name: 'Article' },
  });

  if (articleType) {
    const article1 = await prisma.contentItem.create({
      data: {
        contentTypeId: articleType.id,
        title: 'Welcome to AI-Native CMS',
        slug: 'welcome-to-ai-native-cms',
        status: 'published',
        fields: {
          create: [
            {
              contentTypeId: articleType.id,
              name: 'body',
              type: 'rich_text',
              value: JSON.stringify({
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Welcome to our AI-Native CMS! This platform combines traditional content management with cutting-edge AI capabilities.',
                      },
                    ],
                  },
                ],
              }),
            },
            {
              contentTypeId: articleType.id,
              name: 'excerpt',
              type: 'text',
              value: 'Discover the future of content management.',
            },
          ],
        },
      },
    });

    const article2 = await prisma.contentItem.create({
      data: {
        contentTypeId: articleType.id,
        title: 'Getting Started Guide',
        slug: 'getting-started-guide',
        status: 'draft',
        fields: {
          create: [
            {
              contentTypeId: articleType.id,
              name: 'body',
              type: 'rich_text',
              value: JSON.stringify({
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'This guide will help you get started with creating and managing content.',
                      },
                    ],
                  },
                ],
              }),
            },
            {
              contentTypeId: articleType.id,
              name: 'excerpt',
              type: 'text',
              value: 'Learn how to use the CMS effectively.',
            },
          ],
        },
      },
    });

    console.log('✓ Sample content created:', { article1, article2 });
  }
```

### Acceptance Criteria
- [ ] Sample articles created
- [ ] Both draft and published status represented
- [ ] Dynamic fields populated with realistic data
- [ ] Seed script runs without errors

### Verification Command
```bash
cd backend && npx prisma db seed
```

---

## Execution Order

Follow this exact sequence for Day 2:

1. **RED Phase** (Write failing tests):
   - T017: Unit tests for content service
   - T018: Integration tests for content endpoints
   - Run tests → Should FAIL ❌

2. **GREEN Phase** (Make tests pass):
   - T019: Implement content service
   - T020: Implement content controller
   - T021: Create validation middleware
   - Run tests → Should PASS ✅

3. **Integration Phase**:
   - T022: Wire routes to Express
   - T023: Seed sample content
   - Test manually with curl/Postman

4. **Validation Phase**:
   - Run all tests: `npm test`
   - Test all endpoints manually
   - Verify content CRUD operations work end-to-end

---

## Testing Checklist

After completing all tasks, verify these scenarios:

### Authentication
- [ ] Cannot access content endpoints without JWT token
- [ ] Can access content endpoints with valid JWT token
- [ ] Editor role can create/update/delete content
- [ ] Admin role can create/update/delete content

### Create Content
- [ ] Can create content with title, slug, status
- [ ] Can create content with dynamic fields
- [ ] Auto-generates slug if not provided
- [ ] Validates required fields
- [ ] Returns 201 with created content

### List Content
- [ ] Returns all content items
- [ ] Can filter by contentTypeId
- [ ] Can filter by status (draft/published)
- [ ] Returns content with fields

### Get Content
- [ ] Returns content by ID with fields
- [ ] Returns 404 for non-existent content
- [ ] Includes related data (contentType, fields)

### Update Content
- [ ] Can update title, slug, status
- [ ] Can update fields (add/remove/modify)
- [ ] Returns updated content
- [ ] Returns 404 for non-existent content

### Delete Content
- [ ] Can delete content
- [ ] Returns 204 on success
- [ ] Cascades delete to fields
- [ ] Returns 404 for non-existent content

---

## Manual Testing Commands

```bash
# Start the server
cd backend && npm run dev

# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# Create content
curl -X POST http://localhost:3001/api/v1/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentTypeId": 1,
    "title": "My First Article",
    "slug": "my-first-article",
    "status": "draft",
    "fields": [
      {"name": "body", "type": "rich_text", "value": "Article content here"},
      {"name": "excerpt", "type": "text", "value": "Short description"}
    ]
  }'

# List all content
curl http://localhost:3001/api/v1/content \
  -H "Authorization: Bearer $TOKEN"

# Get specific content
curl http://localhost:3001/api/v1/content/1 \
  -H "Authorization: Bearer $TOKEN"

# Update content
curl -X PUT http://localhost:3001/api/v1/content/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Article Title",
    "status": "published"
  }'

# Delete content
curl -X DELETE http://localhost:3001/api/v1/content/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Success Criteria

Day 2 is complete when:

- [ ] All 7 tasks (T017-T023) marked complete
- [ ] All tests passing (`npm test`)
- [ ] Server runs without errors (`npm run dev`)
- [ ] Can create content via API
- [ ] Can list all content items
- [ ] Can get single content item by ID
- [ ] Can update content and fields
- [ ] Can delete content
- [ ] Content CRUD tested manually with curl
- [ ] Database seeded with sample content

---

## Troubleshooting

### Tests Failing
- Ensure database is migrated: `npx prisma migrate dev`
- Ensure database is seeded: `npx prisma db seed`
- Check test database connection in `.env`

### TypeScript Errors
- Run `npm run build` to check for compilation errors
- Ensure all imports are correct
- Check type definitions match Prisma schema

### Server Won't Start
- Check for port conflicts (3001)
- Verify database connection string in `.env`
- Check for syntax errors in new files

### Routes Not Working
- Verify routes are wired in `index.ts`
- Check middleware order (auth before validation)
- Test with verbose error logging

---

## Next Steps

After Day 2 completion, proceed to:
- **Day 3**: Media Upload & Management (User Story 3)
- Tasks will include media service, upload controller, image processing with Sharp
