# Agent Development Guidelines | 智能体开发指南

This monorepo uses Bun workspaces with an Elysia backend (Bun + TypeORM) and React frontend (Vite).
本项目是一个使用 Bun 工作区的 Monorepo，包含 Elysia 后端（Bun + TypeORM）和 React 前端（Vite）。

## Build, Lint & Test Commands | 构建、代码检查和测试命令

### Root Level | 根目录级别
- `bun dev` - Run all workspace packages in dev mode | 以开发模式运行所有工作区包
- `bun dev:api` - Run API server only (apps/api) | 仅运行 API 服务器（apps/api）
- `bun dev:web` - Run web frontend only (apps/web) | 仅运行 Web 前端（apps/web）
- `bun clean` - Remove all node_modules and dist directories | 清除所有 node_modules 和 dist 目录
- `bun run db:add` - Create a new database migration (prompts for name) | 创建新的数据库迁移（需输入名称）
- `bun run db:build` - Run database migrations | 运行数据库迁移
- `bun run db:undo` - Undo last database migration | 回滚上一个数据库迁移

### API (apps/api)
- `bun dev` - Start API server with hot reload (`--watch src/index.ts`) | 启动 API 服务器，支持热重载
- `bun start` - Start API server (production) | 启动 API 服务器（生产环境）
- `bun run build` - Compile to binary with Bun (`--compile --minify`) | 编译为二进制文件
- `bun run db:build` - Run database migrations | 运行数据库迁移
- `bun run db:undo` - Undo last migration | 回滚上一个迁移
- `bun run db:add` - Create new migration (interactive) | 创建新迁移（交互式）

### Web (apps/web)
- `bun run dev` - Start Vite dev server | 启动 Vite 开发服务器
- `bun run build` - Build for production (`tsc -b && vite build`) | 构建生产版本
- `bun run lint` - Run ESLint on entire project | 运行 ESLint 检查
- `bun run lint --fix` - Auto-fix ESLint issues | 自动修复 ESLint 问题
- `bun run preview` - Preview production build | 预览生产构建

### Running Tests | 运行测试
No test framework is currently configured. When adding tests:
当前未配置测试框架。如需添加测试：
- Add `vitest` to web package for frontend tests | 为 Web 包添加 vitest 用于前端测试
- Add `bun:test` for API tests | 为 API 添加 bun:test 用于后端测试
- Update package.json scripts: `"test": "bun test"`, `"test:watch": "bun test --watch"` | 更新 package.json 脚本

## Code Style Guidelines | 代码风格指南

### TypeScript Configuration | TypeScript 配置
- Strict mode enabled with `noUncheckedIndexedAccess` and `noImplicitOverride` | 启用严格模式，包含 `noUncheckedIndexedAccess` 和 `noImplicitOverride`
- ES modules only (`"type": "module"`) | 仅使用 ES 模块
- Path aliases: `@api/*` → `apps/api/src/*`, `@common/*` → `packages/common/src/*` | 路径别名配置
- Decorators enabled for TypeORM (`experimentalDecorators`, `emitDecoratorMetadata`) | 为 TypeORM 启用装饰器

### Imports | 导入规则
- Use path aliases for internal imports: `import { x } from "@api/lib/response"` | 内部模块使用路径别名
- Use bare specifiers for external packages: `import { Elysia } from "elysia"` | 外部包使用裸说明符
- Group imports in order: external packages → internal packages/aliases | 按顺序分组导入：外部包 → 内部包/别名
- No relative imports for internal modules (use path aliases) | 内部模块不使用相对导入

### File Naming & Organization | 文件命名与组织
- **Entities**: PascalCase + `.entity.ts` (e.g., `system-account.entity.ts`) | 实体类：PascalCase + `.entity.ts`
- **Workers**: kebab-case + `.worker.ts` (e.g., `test.worker.ts`) | 工作者：kebab-case + `.worker.ts`
- **Controllers**: kebab-case + `.controller.ts` | 控制器：kebab-case + `.controller.ts`
- **Services**: kebab-case + `.service.ts` | 服务：kebab-case + `.service.ts`
- **Library/Plugin files**: `index.ts` in directories under `lib/` | 库/插件文件：lib/ 目录下目录中的 `index.ts`
- **Directories**: lowercase (entity, controller, service, lib, queue, modules) | 目录名：小写

### Naming Conventions | 命名规范
- **Classes**: PascalCase (`SystemAccount`, `BusinessError`) | 类：PascalCase
- **Interfaces**: PascalCase (`ProfileType`, `PermissionTreeNode`) | 接口：PascalCase
- **Types**: PascalCase (`AllPermissionKeys`) | 类型：PascalCase
- **Variables/Functions**: camelCase (`response`, `logger`, `getPermission`) | 变量/函数：camelCase
- **Constants/Enums**: PascalCase (`BusinessErrorCode`, `PERMISSION_TREE`) | 常量/枚举：PascalCase
- **Files**: kebab-case for modules, PascalCase for entities/types | 文件：模块用 kebab-case，实体/类型用 PascalCase

### Entity Patterns | 实体模式
All entities extend base classes from `entity/base.entity.ts`:
所有实体继承自 `entity/base.entity.ts` 的基类：
- `BaseEntity` - id, createdAt, updatedAt | 包含 id、createdAt、updatedAt
- `BaseEntitySoftDelete` - adds deletedAt | 增加 deletedAt 字段
- `BaseEntityWithTenant` - adds tenantId | 增加 tenantId 字段
- `BaseEntityWithTenantDepartment` - adds tenantId + departmentId | 增加 tenantId 和 departmentId 字段

Use TypeORM decorators: `@Entity()`, `@Column()`, `@CreateDateColumn()`, `@UpdateDateColumn()`, `@DeleteDateColumn()`. Mark sensitive fields with `{ select: false }`.
使用 TypeORM 装饰器。敏感字段使用 `{ select: false }` 标记。

### Error Handling | 错误处理
- Define business error codes in `lib/error.ts` as `BusinessErrorCode` object | 在 `lib/error.ts` 中定义业务错误码
- Throw `new BusinessError(401)` for known business logic errors | 已知业务逻辑错误抛出 `new BusinessError(401)`
- Global error middleware handles all error types in `lib/error.ts` | 全局错误中间件处理所有错误类型
- All responses return `{ code: number, message: string }` format | 所有响应返回 `{ code, message }` 格式
- HTTP status 200 with business code in body (not HTTP status) | HTTP 状态码为 200，业务码在响应体中

### API Routing (Elysia) | API 路由
- Use `.use()` to register plugins/libraries (error, response, typeorm, winston, queue) | 使用 `.use()` 注册插件/库
- Use `.group()` to organize routes by domain: `.group("/api", (app) => app...)` | 使用 `.group()` 按域组织路由
- Validate requests with Zod schemas in route options | 使用 Zod 模式验证请求
- Response format: `{ code: 0, data: responseValue }` via `lib/response.ts` | 响应格式通过 `lib/response.ts` 包装
- Export `type App` for frontend type generation: `export type App = typeof app` | 导出 `type App` 供前端生成类型
- Controllers return plain objects, let response plugin wrap them | 控制器返回原始对象，由响应插件包装

### Frontend (React + Vite) | 前端
- Use `treaty<App>` from `@elysiajs/eden` for type-safe API calls | 使用 `@elysiajs/eden` 的 `treaty<App>` 进行类型安全的 API 调用
- API client config in `apps/web/src/lib/api.ts` handles response/error transformation | API 客户端配置在 `apps/web/src/lib/api.ts`
- Use React hooks for state management (`useState`, `useRequest` from ahooks) | 使用 React hooks 管理状态
- Use MobX for global state: `mobx` + `mobx-react-lite` | 使用 MobX 管理全局状态
- Component styling: Semi UI (`@douyinfe/semi-ui`) + styled-components | 组件样式：Semi UI + styled-components

### Logging | 日志
- Use `logger` from `lib/logger.ts` (Winston with daily rotate) | 使用 `lib/logger.ts` 中的 logger（Winston 支持日志轮转）
- Levels: info, warn, error, debug | 日志级别：info、warn、error、debug
- Include `context` for filtering: `logger.info("message", { context: "ModuleName" })` | 包含 `context` 用于过滤

### Type Safety | 类型安全
- All entity relationships use number[] for foreign key arrays (e.g., `role: number[]`) | 外键数组使用 `number[]` 类型
- Optional fields use `?` and type unions (e.g., `lastTime?: string | Date`) | 可选字段使用 `?` 和类型联合
- Leverage Elysia's type inference for request/response validation | 利用 Elysia 的类型推断进行请求/响应验证
- Use `as const` for static data: `PERMISSION_TREE = [...] as const` | 静态数据使用 `as const`

### Database Scripts | 数据库脚本
- Migration scripts in `apps/api/script/` directory | 迁移脚本位于 `apps/api/script/` 目录
- Use TypeORM for schema management | 使用 TypeORM 管理数据库模式
- Database config in `lib/typeorm.ts` | 数据库配置在 `lib/typeorm.ts`

### Queue (BullMQ) | 队列
- Workers in `apps/api/src/queue/` with `.worker.ts` suffix | 工作者在 `apps/api/src/queue/`，使用 `.worker.ts` 后缀
- Register workers in `lib/queue-worker.ts` via the `workers` array | 在 `lib/queue-worker.ts` 中通过 `workers` 数组注册
- Use `logger.info()` with context for worker status messages | 使用带 context 的 `logger.info()` 输出工作者状态

### Linting | 代码检查
- Web package uses ESLint with TypeScript-ESLint, React Hooks, React Refresh | Web 包使用 ESLint（包含 TypeScript-ESLint、React Hooks、React Refresh）
- Run `bun run lint` in apps/web to check code quality | 在 apps/web 中运行 `bun run lint` 检查代码质量
- Fix issues with `bun run lint --fix` | 使用 `bun run lint --fix` 自动修复

### Directory Structure | 目录结构
```
apps/
  api/
    src/
      entity/          # TypeORM entities | TypeORM 实体
      lib/             # Core libraries (error, logger, typeorm, etc.) | 核心库
      modules/         # Feature modules (auth, upload, notice, etc.) | 功能模块
      queue/           # BullMQ workers | BullMQ 工作者
      route.ts         # Main route configuration | 主路由配置
      index.ts         # API entry point | API 入口
  web/
    src/
      components/      # React components | React 组件
      lib/             # Utilities and API client | 工具和 API 客户端
      pages/           # Page components | 页面组件
      stores/          # MobX stores | MobX 状态存储
      App.tsx          # Root component | 根组件
```

### General Principles | 一般原则
- **Code comments**: Add comments for complex logic, business rules, or non-obvious implementations | 为复杂逻辑、业务规则或非显而易见的实现添加注释
- **DRY (Don't Repeat Yourself)**: Extract reusable logic into utilities or services | 提取可复用逻辑到工具函数或服务
- **Single Responsibility**: Each function/module should have one clear purpose | 每个函数/模块应有单一职责
- **Error handling**: Always handle potential errors, especially in async operations | 始终处理潜在错误，尤其是异步操作
- **Performance**: Avoid N+1 queries; use proper relations in TypeORM | 避免 N+1 查询；正确使用 TypeORM 关系
- **Security**: Never log secrets or sensitive data; validate all inputs | 永不记录敏感数据；验证所有输入

### Code Review Checklist | 代码审查清单
- [ ] TypeScript types are correct and not overly broad | TypeScript 类型正确且不过于宽泛
- [ ] Error handling is comprehensive | 错误处理全面
- [ ] No console.log statements (use logger instead) | 无 console.log（应使用 logger）
- [ ] Imports are properly organized | 导入组织良好
- [ ] Naming conventions are followed | 遵循命名规范
- [ ] No hardcoded values (use constants/configuration) | 无硬编码值（应使用常量/配置）
- [ ] Database queries are optimized | 数据库查询已优化
- [ ] Sensitive data is properly protected | 敏感数据已妥善保护
