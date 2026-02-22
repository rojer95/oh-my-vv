import { Elysia } from "elysia";
import { authPlugin } from "../../lib/auth";
import { curdPlugin } from "../../lib/curd";
import { PERMISSIONS } from "@rojer/mf-common";
import { SystemOperationLogService } from "./system-operation-log.service";

export const systemOperationLogController = new Elysia()
  .use(authPlugin)
  .use(curdPlugin)
  .group("system-operation-log", (app) =>
    app.post(
      "/read",
      async ({ findManyOption }) => {
        return await SystemOperationLogService.findAndCount(findManyOption);
      },
      {
        findManyOption: {
          tenantId: false,
        },
        auth: { permission: PERMISSIONS.systemOplogView, loggable: false },
      },
    ),
  );
