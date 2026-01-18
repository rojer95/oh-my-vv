# Agent Guidelines for rojer-mf

This document provides guidelines for AI agents working on this codebase.

## Project Overview

A monorepo using Yarn workspaces with Bun, containing:
- **API**: Elysia + TypeORM + PostgreSQL + Zod
- **Web**: React 18 + Vite + MobX + Semi UI
- **Common**: Shared types and constants

## Build Commands

### Root Level
```bash
bun dev              # Watch all workspaces
bun dev:api          # Watch API with hot reload
bun dev:web          # Watch Web with hot reload
bun clean            # Remove all node_modules and dist
```

### API (apps/api)
```bash
bun run              # Bun runtime
bun start            # Same as bun run
bun --watch src/index.ts  # Watch mode
bun build            # Compile to standalone binary
bun db:build         # Build database schema
bun db:add           # Add migration
bun db:undo          # Undo last migration
```

### Web (apps/web)
```bash
bun dev              # Vite dev server
bun build            # TypeScript + Vite build
bun lint             # ESLint check
bun preview          # Preview production build
```

### Testing
**Note**: No test framework is currently configured. Do not add tests unless explicitly requested.

## Code Style Guidelines

### Imports

**Order**: External packages → Internal modules (using path aliases)

```typescript
// 1. External packages
import { useState, useEffect } from "react";
import { Elysia } from "elysia";
import z from "zod";

// 2. Internal path aliases
import { BusinessError } from "../../lib/error";
import { AuthService } from "./auth.service";
import { STORAGE_AUTH_KEY } from "@rojer/mf-common";
```

**Rules**:
- Use named imports, avoid default imports
- Path aliases: `@api/*` for API, `@common/*` for common, `@/*` for web

### Naming Conventions

| Type | Convention | Examples |
|------|------------|----------|
| Files (components/classes) | PascalCase | `UserEntity.ts`, `AuthController.ts` |
| Files (utilities/others) | kebab-case | `dayjs.ts`, `access.ts` |
| Functions/variables | camelCase | `loginUser`, `isValid` |
| Constants | SCREAMING_SNAKE_CASE | `STORAGE_AUTH_KEY`, `BusinessErrorCode` |
| Types/interfaces | PascalCase | `ProfileType`, `PermissionNode` |
| Database entities | PascalCase ending with `Entity` | `SystemAccountEntity` |

### TypeScript

- **Strict mode enabled** (`tsconfig.json`)
- Use explicit types for function parameters and return values
- Avoid `any`; use `unknown` if necessary
- Use `as const` for static configuration objects

```typescript
// Good
interface LoginDto {
  account: string;
  password: string;
}

const login = (dto: LoginDto): Promise<User> => { ... }

// Avoid
const login = (dto: any): any => { ... }
```

### Error Handling

**API Error Pattern** (apps/api/src/lib/error.ts):

```typescript
// Define error codes
export const BusinessErrorCode = {
  Unauthorized: [401, "未经授权的访问"],
  PasswordTooSimple: [10001, "密码太简单"],
} as const;

// Throw business errors
throw new BusinessError(BusinessErrorCode.Unauthorized);
```

**Validation**:
- Use Zod for request validation in `.dto.ts` files
- Attach validation schemas to routes using `{ body: LoginZod }`

**Logging**:
- Use `logger` from `lib/logger` (Winston)
- Never log sensitive data (passwords, tokens)

### File Organization

**API Structure**:
```
apps/api/src/
├── entity/           # TypeORM entities (extend BaseEntity*)
├── modules/          # Feature modules
│   └── {module}/
│       ├── {module}.controller.ts   # Elysia routes
│       ├── {module}.service.ts      # Business logic (static class)
│       ├── {module}.d.ts            # Interfaces
│       └── {module}.dto.ts          # Zod schemas
├── lib/              # Shared plugins/utilities
├── route.ts          # Combine all controllers
└── index.ts          # App entry
```

**Web Structure**:
```
apps/web/src/
├── component/        # React components
├── page/             # Page components
├── hook/             # Custom hooks
├── mobx/             # MobX stores
├── util/             # Utilities
└── config/           # Config files
```

### Entity Pattern

Base entities defined in `apps/api/src/entity/base.entity.ts`:
```typescript
export abstract class BaseEntity { ... }
export abstract class BaseEntitySoftDelete extends BaseEntity { ... }
export abstract class BaseEntityWithTenant extends BaseEntity { ... }
```

Use appropriate base class for new entities.

### API Patterns

**Controller** (Elysia plugin pattern):
```typescript
export const authController = new Elysia()
  .use(auth)
  .group("auth", (app) =>
    app
      .get("/profile", async ({ user }) => { ... }, { auth: true })
      .post("/login", async ({ body }) => { ... }, { body: LoginZod })
  );
```

**Service** (static methods):
```typescript
export abstract class AuthService {
  static async login(account: string, password: string) { ... }
}
```

### React Components

- Use `.tsx` extension
- Use function components with hooks
- Use `observer` from mobx-react-lite for MobX-bound components
- Use the `Access` component for permission-based UI

```typescript
import { observer } from "mobx-react-lite";

export const MyComponent = observer(() => { ... });
```

### ESLint

Web workspace uses ESLint flat config (apps/web/eslint.config.js):
```bash
cd apps/web && bun lint   # Check
cd apps/web && bun lint --fix  # Auto-fix
```

No ESLint config for API workspace - add one if needed.

### Git Workflow

- Create feature branches for changes
- Commit messages should be descriptive
- Never commit `node_modules`, `.env`, or build artifacts

## Key Dependencies

| Layer | Technology |
|-------|------------|
| Runtime | Bun 1.x |
| API Framework | Elysia |
| ORM | TypeORM |
| Validation | Zod |
| JWT | @elysiajs/jwt |
| Logging | Winston |
| Web Framework | React 18 + Vite |
| UI Library | Semi UI |
| State | MobX |
| HTTP Client | Eden Treaty |

## Environment Variables

**API** (.env):
```
JWT_SECRET=your-secret
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

**Web** (.env.production, .env.development):
```
VITE_API=http://localhost:3000
VITE_VERSION=1.0.0
```

## Common Patterns

### Adding a New API Module

1. Create entity in `apps/api/src/entity/`
2. Create controller, service, dto in `apps/api/src/modules/{name}/`
3. Register in `apps/api/src/route.ts`
4. Export types if needed in `@rojer/mf-common`

### Adding a New Web Page

1. Create component in `apps/web/src/page/`
2. Register route in `apps/web/src/config/route.tsx`
3. Add permission check if needed via `handle.access`

### Permission Workflow

1. Define permission key in `apps/common/src/permission-data.ts`
2. Use in API: `{ auth: PERMISSIONS.xxx }`
3. Use in Web: `<Access permission="xxx">...</Access>`
4. Use in Route: `handle: { access: PERMISSIONS.xxx.key }`
