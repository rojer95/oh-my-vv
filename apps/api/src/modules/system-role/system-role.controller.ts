import { FULL_KEY_PERMISSION_TREE, PERMISSIONS } from "@rojer/mf-common";
import Elysia from "elysia";
import z from "zod";
import { authPlugin } from "../../lib/auth";
import { curdPlugin } from "../../lib/curd";
import { zStringId } from "../../lib/custom-zod";
import { SystemDepartmentService } from "../system-department/system-department.service";
import {
  SystemRoleCreateZod,
  SystemRoleFastUpdateZod,
  SystemRoleUpdateZod,
} from "./system-role.dto";
import { SystemRoleService } from "./system-role.service";

export const systemRoleController = new Elysia({ name: "systemRole" })
  .use(authPlugin)
  .use(curdPlugin)
  .group("system-role", (app) =>
    app
      .get(
        "options",
        async ({ tenantId }) => {
          const departments =
            await SystemDepartmentService.findTreeByTenantId(tenantId);
          return { permissions: FULL_KEY_PERMISSION_TREE, departments };
        },
        {
          auth: PERMISSIONS.systemRoleView,
        },
      )
      .post(
        "read",
        async ({ findManyOption }) => {
          return await SystemRoleService.findAndCount(findManyOption);
        },
        {
          auth: PERMISSIONS.systemRoleView,
          findManyOption: true,
        },
      )
      .post(
        "",
        async ({ bodyWithTenantId }) => {
          return await SystemRoleService.create(bodyWithTenantId);
        },
        {
          body: SystemRoleCreateZod,
          auth: PERMISSIONS.systemRoleCreate,
        },
      )

      .put(
        "/:id",
        async ({ params, body, tenantId }) => {
          return await SystemRoleService.update(
            { id: params.id, tenantId },
            body,
          );
        },
        {
          body: SystemRoleUpdateZod,
          auth: PERMISSIONS.systemRoleUpdate,
          params: z.object({ id: zStringId }),
        },
      )
      .delete(
        "/:id",
        async ({ params, tenantId }) => {
          await SystemRoleService.delete({ id: params.id, tenantId });
        },
        {
          auth: PERMISSIONS.systemRoleDelete,
          params: z.object({ id: zStringId }),
        },
      )
      .put(
        "/:id/fastUpdate",
        async ({ params, tenantId, body }) => {
          return await SystemRoleService.fastUpdate(
            { id: params.id, tenantId },
            body,
          );
        },
        {
          body: SystemRoleFastUpdateZod,
          auth: PERMISSIONS.systemRoleUpdate,
          params: z.object({ id: zStringId }),
        },
      ),
  );
