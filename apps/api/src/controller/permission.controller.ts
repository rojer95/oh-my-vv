import { Elysia } from "elysia";
import { PERMISSION_TREE, PERMISSIONS } from "@rojer/mf-common";
import { auth } from "../lib/auth";

export const permissionController = new Elysia()
  .use(auth)
  .group("/api/permissions", (app) =>
    app
      .get("/tree", () => PERMISSION_TREE)
      .get("/flat", () => PERMISSIONS)
      .get(
        "/test",
        () => {
          return "hi";
        },
        {
          auth: PERMISSIONS.systemPermissionView,
        }
      )
  );
