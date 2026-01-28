import { Elysia } from "elysia";
import { authPlugin } from "../../lib/auth";

export const noticeController = new Elysia()
  .use(authPlugin)
  .group("notice", (app) =>
    app
      .get("/", () => {
        return [];
      })
      .post("/readed", () => {}, { auth: { permission: true } }),
  );
