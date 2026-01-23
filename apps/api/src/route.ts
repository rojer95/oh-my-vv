import Elysia from "elysia";
import { authController } from "./modules/auth/auth.controller";
import { uploadController } from "./modules/upload/upload.controller";
import { noticeController } from "./modules/notice/notice.controller";
import { systemConfigController } from "./modules/system-config/system-config.controller";
import { systemRoleController } from "./modules/system-role/system-role.controller";
import { systemAccountController } from "./modules/system-account/system-account.controller";
import { systemDepartmentController } from "./modules/system-department/system-department.controller";

export const allRoutes = new Elysia({ prefix: "/api/v1" })
  .use(authController)
  .use(uploadController)
  .use(noticeController)
  .use(systemConfigController)
  .use(systemRoleController)
  .use(systemAccountController)
  .use(systemDepartmentController);
