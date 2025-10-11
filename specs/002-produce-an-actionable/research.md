# Research Findings: AI-Native CMS MVP

**Date**: October 11, 2025

## Decisions

- **AI Provider**: Use OpenAI API for real AI, with stub fallback. Rationale: Industry standard, easy integration. Alternatives: Anthropic, but OpenAI more accessible.
- **Storage Provider**: Local storage with Sharp for images. Rationale: Simple for MVP, extensible to S3. Alternatives: Cloudinary, but local first.
- **Auth**: JWT with roles. Rationale: Standard, secure. Alternatives: Session-based, but JWT for API.
- **Frontend**: React + Tailwind + shadcn/ui. Rationale: Modern, fast to build. Alternatives: Vue, but React preferred.

## Alternatives Considered

- Single-page app vs multi-page: SPA for better UX.
- Prisma vs raw SQL: Prisma for type safety.
- Express vs Fastify: Express simpler for MVP.

No unresolved clarifications.