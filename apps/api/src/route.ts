import Elysia from "elysia";
import { authController } from "./modules/auth/auth.controller";
import { uploadController } from "./modules/upload/upload.controller";
import { noticeController } from "./modules/notice/notice.controller";
import { systemConfigController } from "./modules/system-config/system-config.controller";

export const allRoutes = new Elysia({ prefix: "/api/v1" })
  .use(authController)
  .use(uploadController)
  .use(noticeController)
  .use(systemConfigController);
