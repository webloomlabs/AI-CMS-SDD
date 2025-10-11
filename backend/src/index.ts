import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthCheck } from './controllers/health';
import { login, loginValidation } from './controllers/auth';
import {
  createContent,
  getContent,
  listContent,
  updateContent,
  deleteContent,
  createContentValidation,
  updateContentValidation,
  getContentValidation,
  deleteContentValidation,
  listContentValidation,
} from './controllers/content';
import { authenticateToken, requireEditor } from './middleware/auth';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/v1/health', healthCheck);
app.post('/api/v1/auth/login', loginValidation, login);

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
  deleteContentValidation,
  deleteContent
);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/v1/health`);
  });
}

export default app;
