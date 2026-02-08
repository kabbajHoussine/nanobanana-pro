# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo built with Bun workspaces and Turborepo. It contains three applications (web, native mobile, server API) sharing code through internal packages.

**Tech Stack:**
- **Runtime:** Bun 1.3.5
- **Web:** React 19 + Vite + TanStack Router + TailwindCSS 4
- **Native:** React Native + Expo 54 + Expo Router + HeroUI Native
- **Server:** Elysia + oRPC + Better-Auth + Drizzle ORM
- **Database:** PostgreSQL (via Docker)

## Common Commands

All commands use Bun:

```bash
# Development - start all apps
bun run dev

# Start individual apps
bun run dev:web      # Vite dev server on http://localhost:3001
bun run dev:server   # Bun hot reload on http://localhost:3000
bun run dev:native   # Expo development server

# Building
bun run build            # Build all apps via Turbo
bun run check-types      # TypeScript check across all packages

# Database (requires Docker)
bun run db:start         # Start PostgreSQL container
bun run db:push          # Push Drizzle schema changes
bun run db:studio        # Open Drizzle Studio UI
bun run db:migrate       # Run database migrations
bun run db:stop          # Stop PostgreSQL container
```

## Architecture

### Monorepo Structure

```
apps/
  web/           # Vite React app (port 3001)
  native/        # Expo React Native app
  server/        # Elysia API server (port 3000)
packages/
  api/           # oRPC router definitions and context
  auth/          # Better-Auth configuration
  db/            # Drizzle ORM schemas and client
  env/           # T3 Env validation (server/web/native)
  config/        # Shared TypeScript base config
```

### Type-Safe API Architecture (oRPC)

The project uses oRPC for end-to-end type safety between client and server:

1. **API Definitions** (`packages/api/src/`):
   - `index.ts` - Exports `publicProcedure` and `protectedProcedure` middleware
   - `routers/` - Router definitions composed into `appRouter`
   - `context.ts` - Request context with auth and database

2. **Server** (`apps/server/src/index.ts`):
   - Elysia app mounts oRPC handlers at `/rpc*` (binary) and `/api*` (REST/OpenAPI)
   - Better-Auth endpoints at `/api/auth/*`
   - AI streaming endpoint at `/ai` (Google Gemini)

3. **Clients** consume the API via `@orpc/tanstack-query` with full type inference.

### Authentication

Better-Auth is configured in `packages/auth/` with:
- Drizzle adapter for database persistence
- Email/password authentication
- Expo support for mobile auth flows
- Multiple trusted origins (web + mobile deep links)

### Database

Drizzle ORM with PostgreSQL:
- Schema definitions in `packages/db/src/schema/`
- Docker Compose for local PostgreSQL
- Migration and studio tools via drizzle-kit

### Environment Variables

T3 Env pattern with three separate configs:
- `packages/env/server.ts` - Server-only env vars
- `packages/env/web.ts` - Web app env vars
- `packages/env/native.ts` - Native app env vars

All env vars are validated with Zod at runtime.
