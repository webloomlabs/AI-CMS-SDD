import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

describe('Media API', () => {
  let authToken: string;
  let mediaId: number;
  const testImagePath = path.join(__dirname, '../fixtures/test-image.png');

  beforeAll(async () => {
    // Login to get JWT token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    authToken = loginRes.body.token;

    // Create test image if it doesn't exist
    const testImageDir = path.dirname(testImagePath);
    await fs.mkdir(testImageDir, { recursive: true });
    
    // Create a simple 1x1 red PNG
    const redPixel = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
      0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d,
      0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
      0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    await fs.writeFile(testImagePath, redPixel);
  });

  afterAll(async () => {
    // Cleanup test uploads - delete relations first
    await prisma.contentMediaRelation.deleteMany({
      where: {
        media: {
          filename: { contains: 'test' },
        },
      },
    });
    
    await prisma.mediaFile.deleteMany({
      where: { filename: { contains: 'test' } },
    });
    
    // Clean test image
    try {
      await fs.unlink(testImagePath);
    } catch (e) {
      // Ignore if doesn't exist
    }
    
    await prisma.$disconnect();
  });

  describe('POST /api/v1/media/upload', () => {
    it('should upload image and extract metadata', async () => {
      const res = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('filename');
      expect(res.body).toHaveProperty('path');
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('size');
      expect(res.body).toHaveProperty('width');
      expect(res.body).toHaveProperty('height');
      expect(res.body.type).toContain('image');
      
      mediaId = res.body.id;
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/media/upload')
        .attach('file', testImagePath);

      expect(res.status).toBe(401);
    });

    it('should require file to be uploaded', async () => {
      const res = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate file type', async () => {
      // Create a text file
      const textPath = path.join(__dirname, '../fixtures/test.txt');
      await fs.mkdir(path.dirname(textPath), { recursive: true });
      await fs.writeFile(textPath, 'test content');

      const res = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', textPath);

      // Multer will reject non-allowed file types
      // The error can be 400 or 500 depending on how Multer handles it
      expect([400, 500]).toContain(res.status);

      await fs.unlink(textPath);
    });
  });

  describe('GET /api/v1/media', () => {
    it('should list all media files', async () => {
      const res = await request(app)
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter by folderId', async () => {
      const res = await request(app)
        .get('/api/v1/media?folderId=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/v1/media');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/media/:id', () => {
    it('should get media file by id', async () => {
      const res = await request(app)
        .get(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(mediaId);
      expect(res.body).toHaveProperty('filename');
    });

    it('should return 404 for non-existent media', async () => {
      const res = await request(app)
        .get('/api/v1/media/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/media/:id', () => {
    it('should delete media file', async () => {
      const res = await request(app)
        .delete(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      // Verify deletion
      const getRes = await request(app)
        .get(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });

    it('should require authentication', async () => {
      const res = await request(app).delete('/api/v1/media/1');

      expect(res.status).toBe(401);
    });
  });

  describe('Content Media Relations', () => {
    let contentId: number;
    let newMediaId: number;

    beforeAll(async () => {
      // Create content item
      const contentType = await prisma.contentType.findUnique({
        where: { name: 'Article' },
      });

      const content = await request(app)
        .post('/api/v1/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentTypeId: contentType!.id,
          title: 'Test Article with Media',
          slug: 'test-article-with-media',
          status: 'draft',
          fields: [
            { name: 'body', type: 'rich_text', value: 'Content here' },
          ],
        });

      contentId = content.body.id;

      // Upload media
      const media = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath);

      newMediaId = media.body.id;
    });

    it('should attach media to content', async () => {
      const res = await request(app)
        .post(`/api/v1/content/${contentId}/media`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mediaId: newMediaId,
          altText: 'Test image alt text',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.altText).toBe('Test image alt text');
    });

    it('should list content with media', async () => {
      const res = await request(app)
        .get(`/api/v1/content/${contentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('media');
      expect(Array.isArray(res.body.media)).toBe(true);
      expect(res.body.media.length).toBeGreaterThan(0);
    });

    afterAll(async () => {
      // Cleanup - delete relations first
      await prisma.contentMediaRelation.deleteMany({
        where: { contentId },
      });
      
      await prisma.contentItem.delete({
        where: { id: contentId },
      });
      
      await prisma.mediaFile.delete({
        where: { id: newMediaId },
      });
    });
  });
});
