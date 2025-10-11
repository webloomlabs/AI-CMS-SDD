# AI-Native CMS MVP

A modern, AI-powered headless Content Management System built with TypeScript, featuring intelligent content generation, media management, and a beautiful admin dashboard.

[![Tests](https://img.shields.io/badge/tests-119%20passing-brightgreen)](./backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18%2B-brightgreen)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](docker-compose.yml)

## 🚀 Features

### Core Features
- **🔐 Authentication & Authorization** - JWT-based auth with role-based access control (Admin, Editor, Viewer)
- **📝 Dynamic Content Management** - Flexible content types with customizable fields
- **🖼️ Media Library** - Upload, manage, and optimize images with automatic metadata extraction
- **🤖 AI Content Generation** - Generate drafts, SEO metadata, and alt text using Google Gemini
- **📊 Admin Dashboard** - Beautiful, responsive React interface with dark mode support

### Technical Highlights
- **Backend**: Node.js 18+ with TypeScript, Express, Prisma ORM
- **Frontend**: React 18+ with TypeScript, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL 15 with Prisma migrations
- **AI Integration**: Google Gemini API with fallback stub provider
- **Media Processing**: Sharp for image optimization
- **Containerization**: Production-ready Docker setup with multi-stage builds
- **Testing**: 119 backend tests + 19 frontend tests passing

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Docker Deployment](#-docker-deployment)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ⚡ Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd AI-CMS3

# Copy environment template
cp .env.docker .env

# Update .env with your settings (especially JWT_SECRET and GEMINI_API_KEY)

# Start the entire stack
./start-docker.sh

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Default login: admin@example.com / Admin123!
```

### Manual Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp backend/.env.sample backend/.env
cp frontend/.env.sample frontend/.env

# Update .env files with your configuration

# Set up database
cd backend
npx prisma migrate deploy
npx prisma db seed

# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory, new terminal)
npm start
```

## 📦 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **PostgreSQL** 15.x or higher (or use Docker)
- **Docker & Docker Compose** (optional, for containerized deployment)
- **Google Gemini API Key** (optional, for AI features)

### Check Prerequisites

```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
docker --version # Optional
psql --version  # PostgreSQL 15+
```

## 🛠️ Installation

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.sample .env

# Edit .env with your settings
# Required: DATABASE_URL, JWT_SECRET
# Optional: GEMINI_API_KEY

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database with initial admin user
npx prisma db seed

# Build TypeScript
npm run build

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.sample .env

# Edit .env with backend URL
# REACT_APP_API_URL=http://localhost:3001

# Start development server
npm start
```

## 💻 Development

### Backend Development

```bash
cd backend

# Run in development mode (auto-reload)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Database commands
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Create new migration
npx prisma db seed         # Seed database
```

### Frontend Development

```bash
cd frontend

# Run in development mode
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Lint code
npm run lint
```

### Database Management

```bash
# Access PostgreSQL (if running locally)
psql -U postgres -d ai_cms

# Or via Docker
docker-compose exec postgres psql -U postgres -d ai_cms

# View database with Prisma Studio
cd backend
npx prisma studio
```

## 🐳 Docker Deployment

### Production Deployment

```bash
# Copy environment template
cp .env.docker .env

# Update .env with production values
# IMPORTANT: Set strong JWT_SECRET and DB_PASSWORD

# Start all services
./start-docker.sh

# Or manually
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Commands

```bash
# Build images
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart backend

# Execute command in container
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres

# Clean up (WARNING: deletes volumes)
docker-compose down -v
```

### Service URLs (Docker)

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Health Check**: http://localhost:3001/api/v1/health

## 📖 API Documentation

Full API documentation is available in [docs/API.md](docs/API.md).

### Quick Reference

**Base URL**: `http://localhost:3001/api/v1`

**Authentication**: JWT Bearer token in `Authorization` header

**Endpoints**:
- `POST /auth/login` - User authentication
- `GET /content` - List content items
- `POST /content` - Create content
- `PUT /content/:id` - Update content
- `DELETE /content/:id` - Delete content
- `POST /media` - Upload media file
- `GET /media` - List media files
- `POST /ai/generate` - Generate AI content
- `GET /health` - Health check

See [docs/API.md](docs/API.md) for detailed request/response formats.

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- health.test.ts

# Run integration tests only
npm test -- --testPathPattern=integration

# Run unit tests only
npm test -- --testPathPattern=unit
```

**Test Results**:
- ✅ 119 tests passing
- 🎯 Coverage: ~85%

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

**Test Results**:
- ✅ 19 tests passing
- 🎯 Component coverage for Toast and AIGenerateModal

## 🔑 Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_cms

# Server
NODE_ENV=development
PORT=3001

# JWT Authentication
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
STORAGE_PROVIDER=local

# AI Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production settings.

### Frontend (.env)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001
```

## 📁 Project Structure

```
AI-CMS3/
├── backend/                # Backend Node.js/Express application
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth, validation, upload
│   │   ├── utils/         # Storage, AI providers
│   │   └── index.ts       # App entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   ├── migrations/    # Database migrations
│   │   └── seed.ts        # Database seeding
│   ├── tests/
│   │   ├── unit/          # Unit tests
│   │   └── integration/   # API integration tests
│   ├── uploads/           # Uploaded media files
│   ├── Dockerfile         # Backend container
│   └── package.json
│
├── frontend/              # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API clients
│   │   ├── hooks/         # React hooks
│   │   └── App.tsx        # App entry point
│   ├── public/            # Static assets
│   ├── tests/             # Component tests
│   ├── Dockerfile         # Frontend container
│   ├── nginx.conf         # nginx configuration
│   └── package.json
│
├── docs/                  # Documentation
│   ├── API.md            # API documentation
│   ├── DEPLOYMENT.md     # Deployment guide
│   └── TROUBLESHOOTING.md
│
├── specs/                 # Feature specifications
│   └── 002-produce-an-actionable/
│
├── docker-compose.yml     # Multi-container setup
├── start-docker.sh        # Automated startup script
├── .env.docker            # Docker environment template
└── README.md              # This file
```

## 🎨 Default Credentials

**Admin Account**:
- Email: `admin@example.com`
- Password: `Admin123!`

**⚠️ IMPORTANT**: Change these credentials in production!

## 🔧 Troubleshooting

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues and solutions.

### Quick Fixes

**Port already in use**:
```bash
# Find process using port
lsof -i :3001  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL

# Kill process
kill -9 <PID>
```

**Database connection error**:
```bash
# Check PostgreSQL is running
pg_isready

# Or with Docker
docker-compose exec postgres pg_isready
```

**Module not found**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.

### Production Checklist

- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Set strong `DB_PASSWORD`
- [ ] Add `GEMINI_API_KEY` for AI features
- [ ] Enable SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/Traefik)
- [ ] Set up database backups
- [ ] Configure log management
- [ ] Enable monitoring and alerts
- [ ] Update default admin credentials
- [ ] Run security audit: `npm audit`

## 📊 Performance

**API Response Times** (average):
- Authentication: <100ms
- Content CRUD: <150ms
- Media upload: <500ms
- AI generation: 2-5s (external API)

**Database**:
- Indexes on frequently queried fields
- Connection pooling enabled
- Query optimization with Prisma

**Frontend**:
- Code splitting with React.lazy
- Image optimization with Sharp
- Gzip compression enabled
- Static asset caching (1 year)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation
- Run linter before committing
- Keep commits atomic and descriptive

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Powered by [Express](https://expressjs.com/)
- Database with [Prisma](https://www.prisma.io/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI by [Google Gemini](https://ai.google.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](../../issues)
- **Email**: support@ai-cms.example.com

---

**Built with ❤️ using TypeScript, React, and AI**
