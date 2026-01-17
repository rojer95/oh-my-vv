import { PERMISSION_TREE, PERMISSIONS } from "@rojer/mf-common";
import { Elysia } from "elysia";
import { auth } from ".";

export const permissionController = new Elysia()
  .use(auth)
  .group("permissions", (app) =>
    app
      .get("/tree", () => PERMISSION_TREE)
      .get("/flat", () => PERMISSIONS)
      .get("/test", async ({}) => {
        return [];
      })
  );
