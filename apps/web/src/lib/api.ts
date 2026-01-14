// 在 apps/web/src/lib/api.ts 中
import type { App } from "@api/index"; // 这里的 @api/index 对应 apps/api/src/index.ts
import { treaty } from "@elysiajs/eden";

export const api = treaty<App>("http://localhost:3000", {
  onResponse: async (response) => {
    const data = await response.json();
    if (data.code === 0) return data.data;
    throw new Error(data.message);
  },
});
