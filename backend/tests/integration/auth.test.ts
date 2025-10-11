import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    // Ensure test database is set up
    // In a real scenario, you'd use a test database
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should login with valid credentials and return JWT token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toMatchObject({
      email: 'admin@example.com',
      role: 'admin',
    });
    expect(typeof response.body.token).toBe('string');
  });

  it('should return 401 for invalid email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      })
      .expect(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid credentials');
  });

  it('should return 401 for invalid password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'wrongpassword',
      })
      .expect(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid credentials');
  });

  it('should return 400 for missing credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'not-an-email',
        password: 'password123',
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should login as editor with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'editor@example.com',
        password: 'editor123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toMatchObject({
      email: 'editor@example.com',
      role: 'editor',
    });
  });
});
