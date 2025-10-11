# Troubleshooting Guide

This guide helps resolve common issues with the AI-Native CMS.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Docker Issues](#docker-issues)
- [Database Issues](#database-issues)
- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [Authentication Problems](#authentication-problems)
- [File Upload Issues](#file-upload-issues)
- [AI Generation Issues](#ai-generation-issues)
- [Performance Issues](#performance-issues)
- [Network & CORS](#network--cors)
- [FAQ](#faq)

---

## Installation Issues

### Node.js Version Mismatch

**Problem**: `error This project requires Node.js 18.x or higher`

**Solution**:
```bash
# Check current version
node --version

# Install Node.js 18+ using nvm
nvm install 18
nvm use 18

# Or download from nodejs.org
```

### npm Install Fails

**Problem**: `EACCES` permission errors during `npm install`

**Solution**:
```bash
# Fix npm permissions
sudo chown -R $USER:$(id -gn $USER) ~/.npm
sudo chown -R $USER:$(id -gn $USER) ~/.config

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### Missing Dependencies

**Problem**: `Module not found` errors

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# For both backend and frontend
cd backend && npm install
cd ../frontend && npm install
```

### Prisma Client Generation Fails

**Problem**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
cd backend

# Generate Prisma Client
npx prisma generate

# If still failing, reinstall
npm uninstall @prisma/client
npm install @prisma/client
npx prisma generate
```

---

## Docker Issues

### Docker Not Running

**Problem**: `Cannot connect to the Docker daemon`

**Solution**:
```bash
# macOS/Windows: Start Docker Desktop

# Linux: Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Check status
docker info
```

### Port Already in Use

**Problem**: `Error starting userland proxy: listen tcp4 0.0.0.0:3001: bind: address already in use`

**Solution**:
```bash
# Find process using port
lsof -i :3001  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3002:3001"  # Map to different host port
```

### Container Fails to Start

**Problem**: Container exits immediately after starting

**Solution**:
```bash
# Check container logs
docker-compose logs backend
docker-compose logs postgres

# Check container status
docker-compose ps

# Try rebuilding
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check for errors in entrypoint script
docker-compose exec backend cat /app/docker-entrypoint.sh
```

### Database Connection Timeout

**Problem**: `Backend container keeps restarting, logs show "Can't reach database server"`

**Solution**:
```bash
# Ensure PostgreSQL is fully started
docker-compose logs postgres

# Check PostgreSQL health
docker-compose exec postgres pg_isready -U postgres

# Increase startup timeout in docker-compose.yml
healthcheck:
  start_period: 60s  # Increase from 40s

# Restart services in correct order
docker-compose down
docker-compose up -d postgres
# Wait 30 seconds
docker-compose up -d backend
docker-compose up -d frontend
```

### Docker Volume Permission Issues

**Problem**: `EACCES: permission denied, open '/app/uploads/...'`

**Solution**:
```bash
# Fix upload directory permissions
sudo chown -R 1001:1001 backend/uploads

# Or in Dockerfile, ensure correct permissions
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads
```

### Out of Disk Space

**Problem**: `no space left on device`

**Solution**:
```bash
# Check disk usage
df -h

# Clean up Docker resources
docker system prune -a --volumes
docker volume prune
docker image prune -a

# Remove unused containers
docker container prune
```

---

## Database Issues

### Connection Refused

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready
# Or for Docker
docker-compose exec postgres pg_isready

# Start PostgreSQL
sudo systemctl start postgresql
# Or for Docker
docker-compose up -d postgres

# Check DATABASE_URL format
# postgresql://user:password@host:5432/database
```

### Invalid Credentials

**Problem**: `password authentication failed for user "postgres"`

**Solution**:
```bash
# Verify credentials in .env
cat .env | grep DATABASE_URL

# Reset PostgreSQL password (local)
sudo -u postgres psql
ALTER USER postgres PASSWORD 'new_password';

# For Docker, recreate database with new password
docker-compose down -v
# Update .env with new password
docker-compose up -d
```

### Migration Fails

**Problem**: `Migration failed: Database is not empty`

**Solution**:
```bash
# Check migration status
npx prisma migrate status

# If development, reset database
npx prisma migrate reset

# For production, manually apply migrations
npx prisma migrate deploy

# If schema is out of sync
npx prisma db push --accept-data-loss  # CAUTION: may lose data
```

### Table Already Exists

**Problem**: `relation "User" already exists`

**Solution**:
```bash
# Check current schema
npx prisma db pull

# Generate Prisma Client from existing schema
npx prisma generate

# Or reset migrations (development only)
npx prisma migrate reset
```

### Database Lock

**Problem**: `database "ai_cms" is being accessed by other users`

**Solution**:
```bash
# Find active connections
sudo -u postgres psql
SELECT pid, usename, application_name 
FROM pg_stat_activity 
WHERE datname = 'ai_cms';

# Terminate connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'ai_cms' AND pid <> pg_backend_pid();
```

---

## Build Issues

### TypeScript Compilation Errors

**Problem**: `error TS2307: Cannot find module`

**Solution**:
```bash
# Ensure all dependencies installed
npm install

# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf dist

# Rebuild
npm run build
```

### Frontend Build Fails

**Problem**: `JavaScript heap out of memory`

**Solution**:
```bash
# Increase Node.js memory
export NODE_OPTIONS=--max-old-space-size=4096
npm run build

# Or add to package.json scripts
"build": "NODE_OPTIONS=--max-old-space-size=4096 react-scripts build"
```

### Missing Environment Variables

**Problem**: `process.env.REACT_APP_API_URL is undefined`

**Solution**:
```bash
# Ensure .env file exists
cp .env.sample .env

# Frontend env vars must start with REACT_APP_
echo "REACT_APP_API_URL=http://localhost:3001" >> frontend/.env

# Restart dev server after changing .env
npm start
```

---

## Runtime Errors

### 500 Internal Server Error

**Problem**: API returns 500 errors

**Solution**:
```bash
# Check backend logs
docker-compose logs backend
# Or for local dev
npm run dev

# Common causes:
# 1. Database connection issue
# 2. Missing environment variables
# 3. Uncaught exception in code

# Enable debug logging
DEBUG=* npm run dev
```

### Cannot Read Property of Undefined

**Problem**: `TypeError: Cannot read property 'X' of undefined`

**Solution**:
```bash
# Check API response format
curl http://localhost:3001/api/v1/content

# Ensure data structure matches frontend expectations
# Add null checks in frontend code:
const content = data?.content ?? [];
```

### JWT Token Expired

**Problem**: `401 Unauthorized: Token expired`

**Solution**:
```bash
# Login again to get new token
# Frontend should automatically redirect to login

# Increase token lifetime in backend/.env
JWT_EXPIRES_IN=30d

# Implement token refresh on frontend
# Check if token is expired before API calls
```

### File System Errors

**Problem**: `ENOENT: no such file or directory, open '/app/uploads/...'`

**Solution**:
```bash
# Ensure uploads directory exists
mkdir -p backend/uploads

# Check permissions
ls -la backend/uploads
chmod 755 backend/uploads

# For Docker, check volume mount
docker-compose exec backend ls -la /app/uploads
```

---

## Authentication Problems

### Cannot Login

**Problem**: Login always returns "Invalid credentials"

**Solution**:
```bash
# Check database has seeded admin user
docker-compose exec backend npx prisma db seed

# Verify admin exists
docker-compose exec postgres psql -U postgres -d ai_cms -c "SELECT email, role FROM \"User\";"

# Try default credentials:
# Email: admin@example.com
# Password: Admin123!

# Check password hashing
# Ensure bcrypt is installed: npm list bcrypt
```

### Token Not Being Sent

**Problem**: API returns 401 even after login

**Solution**:
```javascript
// Check token is saved
localStorage.getItem('token');

// Ensure axios includes token
// In frontend/src/services/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### CORS Blocks Login

**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
```bash
# Check backend CORS configuration
# backend/src/index.ts

# Ensure frontend URL is allowed
app.use(cors({
  origin: 'http://localhost:3000',  # Or your frontend URL
  credentials: true
}));

# For production, use environment variable
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
```

---

## File Upload Issues

### File Too Large

**Problem**: `PayloadTooLargeError: request entity too large`

**Solution**:
```bash
# Increase max file size in backend/.env
MAX_FILE_SIZE=52428800  # 50MB in bytes

# For nginx reverse proxy, increase client_max_body_size
client_max_body_size 50M;
```

### Unsupported File Type

**Problem**: `Error: Only image files are allowed`

**Solution**:
```bash
# Check multer configuration in backend/src/middleware/upload.ts
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

# Supported types: image/jpeg, image/png, image/gif, image/webp
```

### Upload Directory Not Writable

**Problem**: `EACCES: permission denied, open '/app/uploads/...'`

**Solution**:
```bash
# Fix permissions
chmod 755 backend/uploads
chown -R $USER:$USER backend/uploads

# For Docker
docker-compose exec backend chown -R nodejs:nodejs /app/uploads
```

### Sharp Processing Error

**Problem**: `Error: Input file is missing`

**Solution**:
```bash
# Reinstall sharp
cd backend
npm uninstall sharp
npm install sharp

# For Docker, ensure sharp is installed in container
# Check Dockerfile includes: RUN npm install
```

---

## AI Generation Issues

### Gemini API Key Invalid

**Problem**: `Error: API key not valid. Please pass a valid API key.`

**Solution**:
```bash
# Get API key from Google AI Studio
# https://makersuite.google.com/app/apikey

# Add to backend/.env
GEMINI_API_KEY=your-actual-api-key-here

# Restart backend
docker-compose restart backend
```

### AI Generation Times Out

**Problem**: Generation takes too long and times out

**Solution**:
```bash
# Increase timeout in frontend
const response = await api.post('/ai/generate', data, {
  timeout: 60000  // 60 seconds
});

# Use shorter prompts
# Check network connectivity
# Verify API quota not exceeded
```

### Stub Provider Returns Mock Data

**Problem**: AI always returns "This is AI-generated content..."

**Solution**:
```bash
# Check AI_PROVIDER setting
cat backend/.env | grep AI_PROVIDER

# Should be: AI_PROVIDER=gemini
# Not: AI_PROVIDER=stub

# Verify GEMINI_API_KEY is set
cat backend/.env | grep GEMINI_API_KEY

# Restart backend after changes
docker-compose restart backend
```

---

## Performance Issues

### Slow API Response Times

**Problem**: API endpoints take >3 seconds to respond

**Solution**:
```bash
# Check database query performance
# Enable Prisma query logging
# backend/.env
DEBUG=prisma:query

# Add database indexes
npx prisma studio
# Identify slow queries and add indexes

# Enable connection pooling (already enabled in Prisma)

# Check server resources
top
free -m
df -h
```

### High Memory Usage

**Problem**: Backend container uses >2GB RAM

**Solution**:
```bash
# Check memory usage
docker stats

# Limit container memory in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M

# Optimize Prisma connection pool
# backend/src/index.ts
datasources {
  db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
}

# Check for memory leaks
# Use Node.js --inspect flag for debugging
```

### Frontend Slow to Load

**Problem**: Frontend takes >5 seconds to load

**Solution**:
```bash
# Build production version
npm run build

# Enable gzip in nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Use React.lazy for code splitting
# Check browser network tab for slow resources
# Optimize images before upload
```

---

## Network & CORS

### CORS Error on API Calls

**Problem**: `No 'Access-Control-Allow-Origin' header is present`

**Solution**:
```bash
# Backend must include CORS middleware
# backend/src/index.ts
import cors from 'cors';
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));

# For production with different domains
CORS_ORIGIN=https://yourdomain.com

# For development, allow all origins (not for production!)
app.use(cors());
```

### Proxy Issues

**Problem**: Frontend can't reach backend through proxy

**Solution**:
```javascript
// frontend/package.json - Add proxy for development
{
  "proxy": "http://localhost:3001"
}

// Then use relative URLs in API calls
axios.get('/api/v1/content');  // Instead of full URL
```

### WebSocket Connection Failed

**Problem**: If implementing real-time features

**Solution**:
```nginx
# nginx configuration for WebSocket
location /ws {
    proxy_pass http://backend:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

---

## FAQ

### How do I reset the admin password?

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d ai_cms

# Hash new password (use bcrypt with 10 rounds)
# Use online tool or Node.js:
node -e "console.log(require('bcrypt').hashSync('NewPassword123!', 10))"

# Update password in database
UPDATE "User" 
SET password = '$2b$10$...' 
WHERE email = 'admin@example.com';
```

### How do I change the database port?

```yaml
# docker-compose.yml
services:
  postgres:
    ports:
      - "5433:5432"  # Host:Container

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://postgres:password@localhost:5433/ai_cms
```

### How do I enable debug logging?

```bash
# Backend
DEBUG=* npm run dev

# Or specific modules
DEBUG=express:*,prisma:* npm run dev

# Frontend (React)
REACT_APP_LOG_LEVEL=debug npm start
```

### How do I backup/restore data?

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres ai_cms > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres ai_cms < backup.sql

# Backup with Docker volume
docker run --rm -v ai-cms3_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/db-backup.tar.gz /data
```

### How do I run migrations manually?

```bash
# Generate migration
cd backend
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset
```

### How do I check API health?

```bash
# Health endpoint
curl http://localhost:3001/api/v1/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":123,"database":"connected"}

# Check all services
docker-compose ps
docker-compose logs --tail=10 backend
```

### How do I update dependencies?

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package@latest

# Check for security vulnerabilities
npm audit
npm audit fix
```

### How do I enable HTTPS locally?

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout localhost.key -out localhost.crt

# Update nginx configuration
ssl_certificate /etc/nginx/ssl/localhost.crt;
ssl_certificate_key /etc/nginx/ssl/localhost.key;

# Access via https://localhost
# Browser will show security warning (expected for self-signed)
```

### Where are log files stored?

```bash
# Docker logs (not persisted by default)
docker-compose logs

# To persist logs, add volume in docker-compose.yml
volumes:
  - ./logs:/var/log/app

# Application logs (if configured)
backend/logs/
frontend/build/logs/

# nginx access logs
/var/log/nginx/access.log
/var/log/nginx/error.log
```

---

## Getting More Help

If you're still experiencing issues:

1. **Check GitHub Issues**: Search for similar problems
2. **Enable Debug Logging**: Get detailed error messages
3. **Review Recent Changes**: What changed before the issue started?
4. **Test in Isolation**: Reproduce the issue with minimal setup
5. **Check Browser Console**: For frontend issues
6. **Review API Logs**: For backend issues

### Useful Commands for Diagnostics

```bash
# System information
uname -a
node --version
npm --version
docker --version
docker-compose --version

# Service status
docker-compose ps
systemctl status postgresql  # If not using Docker

# Resource usage
docker stats
top
free -m
df -h

# Network connectivity
ping google.com
curl http://localhost:3001/api/v1/health
netstat -tulpn | grep :3001

# Database connectivity
docker-compose exec postgres pg_isready
docker-compose exec postgres psql -U postgres -c "SELECT version();"

# Check environment
docker-compose exec backend env | grep DATABASE_URL
docker-compose exec backend env | grep JWT_SECRET
```

---

For more information:
- [API Documentation](API.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Main README](../README.md)
