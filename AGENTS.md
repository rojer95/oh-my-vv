# Agent Development Guidelines

This monorepo uses Bun workspaces with an Elysia backend (Bun + TypeORM) and React frontend (Vite).

## Build, Lint & Test Commands

### Root Level
- `bun dev` - Run all workspace packages in dev mode
- `bun dev:api` - Run API server only (apps/api)
- `bun dev:web` - Run web frontend only (apps/web)
- `bun clean` - Remove all node_modules and dist directories

### API (apps/api)
- `bun dev` - Start API server with hot reload (--watch)
- `bun start` - Start API server (production)
- `bun db:build` - Run database migrations
- `bun db:undo` - Undo last database migration
- `bun db:add` - Create a new database migration

### Web (apps/web)
- `vite` - Start dev server (or `bun run dev`)
- `vite build` - Build for production (or `bun run build`)
- `eslint .` - Run linting (or `bun run lint`)
- `vite preview` - Preview production build

### Running Tests
No test framework is currently configured. If adding tests, ensure you add scripts to package.json.

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled with `noUncheckedIndexedAccess` and `noImplicitOverride`
- ES modules only (`"type": "module"`)
- Path aliases configured: `@api/*` → `apps/api/src/*`, `@common/*` → `packages/common/src/*`

### Imports
- Use path aliases for internal imports: `import { x } from "@api/lib/response"`
- Use bare specifiers for external packages: `import { Elysia } from "elysia"`
- Group imports: external packages first, then internal packages/aliases

### File Naming & Organization
- **Entities**: PascalCase + `.entity.ts` (e.g., `system-account.entity.ts`)
- **Workers**: kebab-case + `.worker.ts` (e.g., `test.worker.ts`)
- **Library/Plugin files**: `index.ts` in directories under `lib/`
- **Directories**: lowercase (entity, controller, service, lib, queue)

### Naming Conventions
- **Classes**: PascalCase (`SystemAccount`, `BusinessError`)
- **Variables/Functions**: camelCase (`response`, `logger`)
- **Constants**: PascalCase for enums (`BusinessErrorCode`)
- **Route handlers**: Use `.group()` to organize routes by domain

### Entity Patterns
- All entities extend base classes from `entity/base.entity.ts`:
  - `BaseEntity` - id, createdAt, updatedAt
  - `BaseEntitySoftDelete` - adds deletedAt
  - `BaseEntityWithTenant` - adds tenantId
  - `BaseEntityWithTenantDepartment` - adds tenantId + departmentId
- Use TypeORM decorators: `@Entity()`, `@Column()`, `@CreateDateColumn()`, `@UpdateDateColumn()`, `@DeleteDateColumn()`
- Mark sensitive fields with `{ select: false }`

### Error Handling
- Define business error codes in `lib/error/business.error.ts` as `BusinessErrorCode` object
- Throw `new BusinessError(401)` for known business logic errors
- Global error middleware in `lib/error/index.ts` handles all error types
- Always returns `{ code, message }` format in responses

### API Routing (Elysia)
- Use `.use()` to register plugins/libraries (error, response, typeorm, winston, queue)
- Use `.group()` to organize routes (e.g., `.group("/api", (app) => ...)`)
- Validate requests with Zod schemas in route options
- Response format: `{ code: 0, data: responseValue }` via `lib/response/index.ts`
- Export `type App` for frontend type generation: `export type App = typeof app`

### Frontend (React + Vite)
- Use `treaty<App>` from `@elysiajs/eden` for type-safe API calls
- API client config in `apps/web/src/lib/api.ts` handles response/error transformation
- Use React hooks for state management (`useState`, `useRequest` from ahooks)

### Logging
- Use `logger` from `lib/winston/winston.ts` (Winston with daily rotate)
- Levels: info, warn, error, debug
- Include `context` for filtering: `logger.info("message", { context: "ModuleName" })`

### Type Safety
- All entity relationships use number[] for foreign key arrays (e.g., `role: number[]`)
- Optional fields should use `?` and type unions (e.g., `lastTime?: string | Date`)
- Leverage Elysia's type inference for request/response validation

### Database Scripts
- Migration scripts in `apps/api/script/` directory
- Use TypeORM for schema management
- Database config in `lib/typeorm/db.ts`

### Queue (BullMQ)
- Workers in `apps/api/src/queue/` with `.worker.ts` suffix
- Register workers in `lib/queue/index.ts` via the `workers` array
- Use `logger.info()` with context for worker status messages
