# AI-Native CMS Backend

A headless CMS with AI-powered content generation capabilities built with Node.js, TypeScript, Express, and Prisma.

## Features

- 🔐 JWT-based authentication with role-based access control
- 📝 Content management with dynamic fields
- 🖼️ Media upload and management with image processing
- 🤖 AI-powered content generation (stub implementation with extensible provider interface)
- 🗄️ PostgreSQL database with Prisma ORM
- 🚀 RESTful API
- ✅ TypeScript for type safety

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or remote)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.sample` to `.env` and update the values:

```bash
cp .env.sample .env
```

Update the `DATABASE_URL` in `.env` with your PostgreSQL connection string.

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

### 5. Seed Database

```bash
npm run prisma:seed
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- Editor user: `editor@example.com` / `editor123`
- Default content type: Article

### 6. Start Development Server

```bash
npm run dev
```

The server will start on http://localhost:3001

## API Endpoints

### Health Check
- `GET /api/v1/health` - Check server and database status

### Authentication (Coming in Phase 3)
- `POST /api/v1/auth/login` - Login and get JWT token

### Content Management (Coming in later phases)
- Content CRUD endpoints
- Media upload and management
- AI content generation

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware (auth, validation)
│   ├── utils/           # Helper functions
│   └── index.ts         # App entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seed script
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
└── dist/               # Compiled JavaScript (gitignored)
```

## Database Schema

The application uses the following models:

- **User** - System users with email and password
- **Role** - User roles (admin, editor)
- **ContentType** - Defines content structure
- **ContentItem** - Content instances
- **ContentField** - Dynamic fields for content
- **MediaFile** - Uploaded media files
- **MediaFolder** - Media organization
- **MediaTransformation** - Processed media versions
- **ContentMediaRelation** - Links content to media

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with initial data

## Environment Variables

See `.env.sample` for all available configuration options:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `AI_PROVIDER` - AI provider (stub/openai)
- `AI_API_KEY` - API key for AI provider
- `STORAGE_PROVIDER` - Storage provider (local/s3/cloudinary)

## Development Status

**Phase 1: Setup** ✅ Complete
- Project structure created
- Dependencies installed
- TypeScript configured
- Linting and formatting set up

**Phase 2: Foundational** ✅ Complete
- Prisma schema defined with all models
- Database migrations created
- Auth service with JWT and bcrypt
- Auth middleware for role-based access
- Health check endpoint
- Database seeded with admin user

**Phase 3: User Story 1 - Admin Authentication** 🚧 In Progress
- Tests pending
- Auth controller implementation pending
- Integration pending

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## License

ISC
