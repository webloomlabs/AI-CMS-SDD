import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('AI API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get JWT token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/ai/generate', () => {
    it('should generate draft content', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'draft',
          prompt: 'Write an article about TypeScript best practices',
          context: 'TypeScript development guide'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('result');
      expect(typeof res.body.result).toBe('string');
      expect(res.body.result.length).toBeGreaterThan(0);
    });

    it('should generate SEO metadata', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'seo',
          prompt: 'Generate SEO for article about TypeScript',
          context: 'TypeScript is a typed superset of JavaScript'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('result');
      expect(typeof res.body.result).toBe('string');
    });

    it('should generate alt text', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'alt_text',
          prompt: 'Generate alt text for code-screenshot.png',
          context: 'Screenshot of TypeScript code'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('result');
      expect(typeof res.body.result).toBe('string');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          mode: 'draft',
          prompt: 'Test prompt'
        });

      expect(res.status).toBe(401);
    });

    it('should validate mode parameter', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'invalid_mode',
          prompt: 'Test prompt'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should require prompt parameter', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'draft'
          // Missing prompt
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should work with stub provider when no API key', async () => {
      // This test assumes AI_PROVIDER=stub or GEMINI_API_KEY not set
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'draft',
          prompt: 'Test with stub',
          context: 'Testing stub fallback'
        });

      expect(res.status).toBe(200);
      expect(res.body.result).toContain('[STUB');
    });

    it('should handle long prompts', async () => {
      const longPrompt = 'Write about '.repeat(100) + 'AI';
      
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'draft',
          prompt: longPrompt
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('result');
    });

    it('should return result within acceptable time', async () => {
      const startTime = Date.now();

      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'draft',
          prompt: 'Quick test'
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(res.status).toBe(200);
      // Should respond within 10 seconds (per success criteria)
      expect(duration).toBeLessThan(10000);
    });
  });
});
