// 在 apps/web/src/lib/api.ts 中
import type { App } from "@api/index"; // 这里的 @api/index 对应 apps/api/src/index.ts
import { edenTreaty } from "@elysiajs/eden";

export const api = edenTreaty<App>("http://localhost:3000");
