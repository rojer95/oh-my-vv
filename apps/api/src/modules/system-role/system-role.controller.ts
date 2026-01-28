import {
  filterPermissionTree,
  FULL_KEY_PERMISSION_TREE,
  PERMISSIONS,
} from "@rojer/mf-common";
import Elysia from "elysia";
import { isArray } from "lodash-es";
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
        async ({ tenantId, user }) => {
          const departments =
            await SystemDepartmentService.findTreeByTenantId(tenantId);
          const accountType = user!.accountType;
          return {
            permissions: filterPermissionTree(
              FULL_KEY_PERMISSION_TREE,
              (node) => {
                if (
                  isArray(node.accountType) &&
                  !node.accountType.includes(accountType)
                )
                  return false;
                return true;
              },
            ),
            departments,
          };
        },
        {
          auth: { permission: PERMISSIONS.systemRoleView, loggable: false },
        },
      )
      .post(
        "read",
        async ({ findManyOption }) => {
          return await SystemRoleService.findAndCount(findManyOption);
        },
        {
          auth: { permission: PERMISSIONS.systemRoleView, loggable: false },
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
