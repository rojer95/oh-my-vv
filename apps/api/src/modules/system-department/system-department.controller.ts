import { PERMISSIONS } from "@rojer/mf-common";
import Elysia from "elysia";
import { authPlugin } from "../../lib/auth";
import { curdPlugin } from "../../lib/curd";
import {
  SystemDepartmentCreateZod,
  SystemDepartmentFastUpdateZod,
  SystemDepartmentUpdateZod,
} from "./system-department.dto";
import { SystemDepartmentService } from "./system-department.service";
import z from "zod";
import { zStringId } from "../../lib/custom-zod";

export const systemDepartmentController = new Elysia({
  name: "systemDepartment",
})
  .use(authPlugin)
  .use(curdPlugin)
  .group("system-department", (app) =>
    app
      .get(
        "tree",
        async ({ tenantId }) => {
          return await SystemDepartmentService.findTreeByTenantId(tenantId);
        },
        {
          auth: {
            permission: PERMISSIONS.systemDepartmentView,
            loggable: false,
          },
        },
      )
      .post(
        "",
        async ({ body }) => {
          return await SystemDepartmentService.create(body);
        },
        {
          body: SystemDepartmentCreateZod,
          auth: PERMISSIONS.systemDepartmentCreate,
        },
      )
      .put(
        "/:id",
        async ({ params, body, tenantId }) => {
          return await SystemDepartmentService.update(
            { id: params.id, tenantId },
            body,
          );
        },
        {
          body: SystemDepartmentUpdateZod,
          auth: PERMISSIONS.systemDepartmentUpdate,
          params: z.object({ id: zStringId }),
        },
      )
      .delete(
        "/:id",
        async ({ params, tenantId }) => {
          await SystemDepartmentService.delete({ id: params.id, tenantId });
        },
        {
          auth: PERMISSIONS.systemDepartmentDelete,
          params: z.object({ id: zStringId }),
        },
      )
      .put(
        "/:id/fastUpdate",
        async ({ params, body, tenantId }) => {
          return await SystemDepartmentService.fastUpdate(
            { id: params.id, tenantId },
            body,
          );
        },
        {
          body: SystemDepartmentFastUpdateZod,
          auth: PERMISSIONS.systemDepartmentUpdate,
          params: z.object({ id: zStringId }),
        },
      ),
  );
