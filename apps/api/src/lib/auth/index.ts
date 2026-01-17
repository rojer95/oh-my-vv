import Elysia from "elysia";
import { Permission } from "@rojer/mf-common";

export const auth = new Elysia({ name: "lib_auth" }).macro({
  auth: (permission: Permission) => ({
    beforeHandle() {},
  }),
});
