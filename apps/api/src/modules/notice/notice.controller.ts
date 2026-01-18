import { Elysia } from "elysia";
import { auth } from "../auth/auth.plugin";

export const noticeController = new Elysia().use(auth).group("notice", (app) =>
  app
    .get("/", () => {
      return [];
    })
    .post("/readed", () => {}, { auth: true }),
);
