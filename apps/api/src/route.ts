import Elysia from "elysia";
import { authController } from "./modules/auth/auth.controller";
import { noticeController } from "./modules/notice/notice.controller";
import { systemAccountController } from "./modules/system-account/system-account.controller";
import { systemConfigController } from "./modules/system-config/system-config.controller";
import { systemDepartmentController } from "./modules/system-department/system-department.controller";
import { systemDictDetailController } from "./modules/system-dict/system-dict-detail.controller";
import { systemDictController } from "./modules/system-dict/system-dict.controller";
import { systemOperationLogController } from "./modules/system-operation-log/system-operation-log.controller";
import { systemRoleController } from "./modules/system-role/system-role.controller";
import { uploadController } from "./modules/upload/upload.controller";

export const allRoutes = new Elysia({ prefix: "/api/v1" })
  .use(authController)
  .use(uploadController)
  .use(noticeController)
  .use(systemConfigController)
  .use(systemRoleController)
  .use(systemAccountController)
  .use(systemDepartmentController)
  .use(systemDictController)
  .use(systemDictDetailController)
  .use(systemOperationLogController);
