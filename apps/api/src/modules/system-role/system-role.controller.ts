import { FULL_KEY_PERMISSION_TREE, PERMISSIONS } from "@rojer/mf-common";
import Elysia from "elysia";
import { findManyOption } from "../../lib/find-many-option";
import { auth } from "../auth/auth.plugin";
import {
  SystemRoleCreateZod,
  SystemRoleFastUpdateZod,
  SystemRoleUpdateZod,
} from "./system-role.dto";
import { SystemRoleService } from "./system-role.service";

export const systemRoleController = new Elysia({ name: "systemRole" })
  .use(auth)
  .use(findManyOption)
  .group("system-role", (app) =>
    app
      .get(
        "options",
        async () => {
          return { permissions: FULL_KEY_PERMISSION_TREE };
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
          findManyOption: { tenantId: true },
        },
      )
      .post(
        "",
        async ({ body }) => {
          return await SystemRoleService.create(body);
        },
        {
          body: SystemRoleCreateZod,
          auth: PERMISSIONS.systemRoleCreate,
        },
      )
      .get(
        "/:id",
        async ({ params }) => {
          return await SystemRoleService.findById(Number(params.id));
        },
        {
          auth: PERMISSIONS.systemRoleView,
        },
      )
      .put(
        "/:id",
        async ({ params, body }) => {
          return await SystemRoleService.update(Number(params.id), body);
        },
        {
          body: SystemRoleUpdateZod,
          auth: PERMISSIONS.systemRoleUpdate,
        },
      )
      .delete(
        "/:id",
        async ({ params }) => {
          await SystemRoleService.delete(Number(params.id));
        },
        {
          auth: PERMISSIONS.systemRoleDelete,
        },
      )
      .put(
        "/:id/fastUpdate",
        async ({ params, body }) => {
          return await SystemRoleService.fastUpdate(Number(params.id), body);
        },
        {
          body: SystemRoleFastUpdateZod,
          auth: PERMISSIONS.systemRoleUpdate,
        },
      ),
  );
