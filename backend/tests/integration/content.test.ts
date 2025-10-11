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

    // Get Article content type
    const contentType = await prisma.contentType.findUnique({
      where: { name: 'Article' },
    });
    contentTypeId = contentType!.id;
  });

  afterAll(async () => {
    // Cleanup test content
    await prisma.contentItem.deleteMany({
      where: { title: { contains: 'Test Article' } },
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
          title: 'Test Article Create',
          slug: 'test-article-create',
          status: 'draft',
          fields: [
            { name: 'body', type: 'rich_text', value: 'Content here' },
            { name: 'excerpt', type: 'text', value: 'Short excerpt' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Test Article Create');
      expect(res.body.fields).toHaveLength(2);
      contentItemId = res.body.id;
    });

    it('should auto-generate slug if not provided', async () => {
      const res = await request(app)
        .post('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentTypeId,
          title: 'Test Article Auto Slug',
          status: 'draft',
          fields: [
            { name: 'body', type: 'rich_text', value: 'Content' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('slug');
      expect(res.body.slug).toBe('test-article-auto-slug');

      // Cleanup
      await prisma.contentItem.delete({
        where: { id: res.body.id },
      });
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/content')
        .send({
          contentTypeId,
          title: 'Test',
          status: 'draft',
          fields: [],
        });

      expect(res.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing contentTypeId, title, status
          fields: [],
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should validate title is not empty', async () => {
      const res = await request(app)
        .post('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentTypeId,
          title: '',
          status: 'draft',
          fields: [],
        });

      expect(res.status).toBe(400);
    });

    it('should validate status is draft or published', async () => {
      const res = await request(app)
        .post('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentTypeId,
          title: 'Test',
          status: 'invalid-status',
          fields: [],
        });

      expect(res.status).toBe(400);
    });

    it('should validate fields is an array', async () => {
      const res = await request(app)
        .post('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentTypeId,
          title: 'Test',
          status: 'draft',
          fields: 'not-an-array',
        });

      expect(res.status).toBe(400);
    });

    it('should validate field structure', async () => {
      const res = await request(app)
        .post('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentTypeId,
          title: 'Test',
          status: 'draft',
          fields: [
            { name: 'body' }, // Missing type and value
          ],
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/content', () => {
    beforeAll(async () => {
      // Ensure we have test content
      if (!contentItemId) {
        const content = await prisma.contentItem.create({
          data: {
            contentTypeId,
            title: 'Test Article List',
            slug: 'test-article-list',
            status: 'draft',
            fields: {
              create: [
                {
                  contentTypeId,
                  name: 'body',
                  type: 'rich_text',
                  value: 'Test content',
                },
              ],
            },
          },
        });
        contentItemId = content.id;
      }
    });

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

    it('should filter by both contentTypeId and status', async () => {
      const res = await request(app)
        .get(`/api/v1/content?contentTypeId=${contentTypeId}&status=draft`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.forEach((item: any) => {
        expect(item.contentTypeId).toBe(contentTypeId);
        expect(item.status).toBe('draft');
      });
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/v1/content');

      expect(res.status).toBe(401);
    });

    it('should validate contentTypeId is an integer', async () => {
      const res = await request(app)
        .get('/api/v1/content?contentTypeId=invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });

    it('should validate status is valid', async () => {
      const res = await request(app)
        .get('/api/v1/content?status=invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/content/:id', () => {
    it('should get content by id with fields', async () => {
      const res = await request(app)
        .get(`/api/v1/content/${contentItemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(contentItemId);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('slug');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('fields');
      expect(res.body).toHaveProperty('contentType');
      expect(Array.isArray(res.body.fields)).toBe(true);
    });

    it('should return 404 for non-existent content', async () => {
      const res = await request(app)
        .get('/api/v1/content/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const res = await request(app).get(`/api/v1/content/${contentItemId}`);

      expect(res.status).toBe(401);
    });

    it('should validate id is an integer', async () => {
      const res = await request(app)
        .get('/api/v1/content/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
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
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Test Article');
      expect(res.body.status).toBe('published');
    });

    it('should update content fields', async () => {
      const res = await request(app)
        .put(`/api/v1/content/${contentItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fields: [
            { name: 'body', type: 'rich_text', value: 'Updated content here' },
            { name: 'excerpt', type: 'text', value: 'Updated excerpt' },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.fields).toHaveLength(2);
      expect(res.body.fields.some((f: any) => f.value === 'Updated content here')).toBe(true);
    });

    it('should return 404 for non-existent content', async () => {
      const res = await request(app)
        .put('/api/v1/content/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated',
        });

      expect(res.status).toBe(404);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .put(`/api/v1/content/${contentItemId}`)
        .send({
          title: 'Updated',
        });

      expect(res.status).toBe(401);
    });

    it('should validate id is an integer', async () => {
      const res = await request(app)
        .put('/api/v1/content/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated',
        });

      expect(res.status).toBe(400);
    });

    it('should validate status if provided', async () => {
      const res = await request(app)
        .put(`/api/v1/content/${contentItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'invalid-status',
        });

      expect(res.status).toBe(400);
    });

    it('should validate fields if provided', async () => {
      const res = await request(app)
        .put(`/api/v1/content/${contentItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fields: 'not-an-array',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/content/:id', () => {
    let deleteTestContentId: number;

    beforeEach(async () => {
      // Create a content item for deletion test
      const content = await prisma.contentItem.create({
        data: {
          contentTypeId,
          title: 'Test Article to Delete',
          slug: `test-article-delete-${Date.now()}`,
          status: 'draft',
          fields: {
            create: [
              {
                contentTypeId,
                name: 'body',
                type: 'rich_text',
                value: 'Content to be deleted',
              },
            ],
          },
        },
      });
      deleteTestContentId = content.id;
    });

    it('should delete content item', async () => {
      const res = await request(app)
        .delete(`/api/v1/content/${deleteTestContentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      // Verify deletion
      const getRes = await request(app)
        .get(`/api/v1/content/${deleteTestContentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });

    it('should cascade delete fields', async () => {
      await request(app)
        .delete(`/api/v1/content/${deleteTestContentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Verify fields are also deleted
      const fields = await prisma.contentField.findMany({
        where: { contentItemId: deleteTestContentId },
      });

      expect(fields).toHaveLength(0);
    });

    it('should return 404 for non-existent content', async () => {
      const res = await request(app)
        .delete('/api/v1/content/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should require authentication', async () => {
      const res = await request(app).delete(`/api/v1/content/${deleteTestContentId}`);

      expect(res.status).toBe(401);
    });

    it('should validate id is an integer', async () => {
      const res = await request(app)
        .delete('/api/v1/content/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('Content workflow end-to-end', () => {
    it('should support full CRUD lifecycle', async () => {
      // 1. Create
      const createRes = await request(app)
        .post('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentTypeId,
          title: 'Test Article Workflow',
          slug: 'test-article-workflow',
          status: 'draft',
          fields: [
            { name: 'body', type: 'rich_text', value: 'Initial content' },
          ],
        });

      expect(createRes.status).toBe(201);
      const createdId = createRes.body.id;

      // 2. Read
      const getRes = await request(app)
        .get(`/api/v1/content/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.title).toBe('Test Article Workflow');

      // 3. Update
      const updateRes = await request(app)
        .put(`/api/v1/content/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Workflow Article',
          status: 'published',
          fields: [
            { name: 'body', type: 'rich_text', value: 'Updated content' },
          ],
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.title).toBe('Updated Workflow Article');
      expect(updateRes.body.status).toBe('published');

      // 4. List (should include our item)
      const listRes = await request(app)
        .get('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listRes.status).toBe(200);
      const found = listRes.body.find((item: any) => item.id === createdId);
      expect(found).toBeDefined();
      expect(found.title).toBe('Updated Workflow Article');

      // 5. Delete
      const deleteRes = await request(app)
        .delete(`/api/v1/content/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(204);

      // 6. Verify deletion
      const getDeletedRes = await request(app)
        .get(`/api/v1/content/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getDeletedRes.status).toBe(404);
    });
  });
});
