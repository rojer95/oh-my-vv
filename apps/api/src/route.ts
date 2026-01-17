import Elysia from "elysia";
import { permissionController } from "./modules/auth/permission.controller";

export const allRoutes = new Elysia({ prefix: "/api/v1" }).use(
  permissionController
);
