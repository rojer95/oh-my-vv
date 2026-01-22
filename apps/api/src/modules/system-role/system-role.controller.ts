import { Elysia } from "elysia";

const mockRoles = [
  { id: 1, name: "超级管理员", active: true },
  { id: 2, name: "管理员", active: true },
  { id: 3, name: "编辑", active: true },
  { id: 4, name: "查看者", active: true },
];

export const systemRoleController = new Elysia({ name: "systemRole" }).group(
  "system-role",
  (app) =>
    app.post("read", async () => {
      return { list: mockRoles, total: mockRoles.length };
    }),
);
