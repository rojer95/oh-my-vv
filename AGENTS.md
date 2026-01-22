# Agent Guidelines for rojer-mf

## 项目概述

Bun monorepo，包含 3 个 workspace：
- **API**: Elysia + TypeORM + PostgreSQL + Zod + BullMQ
- **Web**: React 18 + Vite + MobX + Semi UI
- **Common**: 共享类型和常量

## 构建命令

```bash
# 根目录
bun dev              # Watch all workspaces
bun dev:api          # Watch API with hot reload
bun dev:web          # Watch Web with hot reload
bun clean            # Remove node_modules and dist

 # API (apps/api)
bun run / bun start  # Bun runtime
bun --watch src/index.ts
bun build            # Compile to standalone binary
bun db:build         # Build database schema
bun db:add           # Add migration
bun db:undo          # Undo last migration

# Web (apps/web)
bun dev              # Vite dev server
bun build            # TypeScript + Vite build
bun lint             # ESLint check (flat config format)
bun preview          # Preview production build
```

**注意**: 测试框架未配置，请勿主动添加。

## 代码规范

### 路径别名

API: `@api/*` → `apps/api/src/*`, `@common/*` → `apps/common/src/*`
Web: `@/asset/*`, `@/component/*`, `@/exception/*`, `@/hook/*`, `@/mobx/*`, `@/schema/*`, `@/util`, `@/dayjs`, `@/api`

```typescript
import { SystemAccount } from "@api/entity/system-account.entity";
import { STORAGE_AUTH_KEY } from "@common/constant";
import { api, apiProxy } from "@/api";
import { Access } from "@/component/auth/access";
```

**导入顺序**: 外部包 → 内部模块（使用路径别名）

### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 文件（组件/类） | PascalCase | `UserEntity.ts` |
| 文件（工具/其他） | kebab-case | `dayjs.ts` |
| 函数/变量 | camelCase | `loginUser` |
| 常量 | SCREAMING_SNAKE_CASE | `STORAGE_AUTH_KEY` |
| 类型/接口 | PascalCase | `ProfileType` |
| 实体 | PascalCase + Entity | `SystemAccountEntity` |

### TypeScript

严格模式启用。使用显式类型，避免 `any`（用 `unknown` 替代）。

**API 特殊配置**:
- `experimentalDecorators: true` (TypeORM 需要)
- `emitDecoratorMetadata: true` (TypeORM 需要)
- `strictPropertyInitialization: false` (属性由插件注入)

```typescript
@Entity()
export class SystemAccount extends BaseEntitySoftDeleteWithTenantDepartment { ... }
```

### 错误处理

**API**: 使用 `BusinessError(code, args)`，code 格式 `[HTTP状态码, 消息]`：

```typescript
throw new BusinessError(BusinessErrorCode.Unauthorized);
throw new BusinessError(BusinessErrorCode.PasswordTooSimple);
```

验证：Zod schemas 放在 `.dto.ts`，通过 `{ body: LoginZod }` 绑定。日志：使用 `logger`（Winston），禁止记录敏感数据。

**响应格式**: 全局 `responsePlugin` 自动包装所有成功响应为 `{ code: 0, data: ... }`

## 文件结构

```
apps/api/src/
├── entity/           # TypeORM entities
├── modules/{name}/   # 控制器、服务、DTO
├── lib/              # 插件和工具
├── queue/            # BullMQ 队列
├── worker/           # 队列 worker
├── script/           # 数据库迁移脚本
├── route.ts          # 组合所有控制器
└── index.ts          # 入口

apps/web/src/
├── component/        # 组件（含 layout/ 子目录）
├── page/             # 页面
├── hook/             # 自定义 Hook
├── mobx/             # MobX Store
├── util/ exception/ schema/ asset/  # 工具/异常/Schema/资源
├── config/           # 路由配置
└── api.ts            # Eden Treaty 客户端
```

实体基类：`BaseEntity` → `BaseEntitySoftDelete` → `BaseEntityWithTenant`

## 前端 API 调用

使用 `@elysiajs/eden` 的 `treaty` 客户端（`apps/web/src/api.ts`）：

```typescript
import { api, apiProxy } from "@/api";

// GET 请求
const { data, error } = await api.api.v1.auth.profile.get();

// POST 请求（带参数）
await api.api.v1.auth.login.post({ account, password });

// 动态路径
api.api.user({ id: 1 }).posts.get();

// 配合 ahooks/useRequest 使用 apiProxy
useRequest(apiProxy(api.api.v1.auth.captcha.get), {...});
```

Eden 使用树状语法（`.` 替代 `/`，方法名替代 HTTP 方法）：`/auth/login` → `.auth.login.post()`, `/user/:id` → `.user({ id: 1 }).get()`

## 常用模式

### 新增 API 模块

在 `entity/` 创建实体 → `modules/{name}/` 创建控制器、服务、DTO → 在 `route.ts` 注册 → 需要时在 `@rojer/mf-common` 导出类型

### 新增 Web 页面

在 `page/` 创建页面组件 → 在 `config/route.tsx` 注册路由 → 通过 `handle.access` 添加权限检查

### 权限工作流

在 `permission-data.ts` 定义权限 key → API 使用 `{ auth: PERMISSIONS.xxx }` → Web 使用 `<Access permission="xxx">...</Access>` → 路由使用 `handle: { access: PERMISSIONS.xxx.key }`

### 其他模式

**BullMQ**: 定义队列 (`queue/*.queue.ts`) → worker (`worker/*.worker.ts`) → 注册 (`queueWorkerPlugin({ workers: ["mail"] })`)

**MobX Observer**: `export const ComponentName = observer(() => { ... })`
