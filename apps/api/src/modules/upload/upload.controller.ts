import { Elysia } from "elysia";
import { auth } from "../auth/auth.plugin";
import { UploadSignResult } from "@rojer/mf-common";

export const uploadController = new Elysia().use(auth).group("upload", (app) =>
  app.post(
    "/sign",
    () => {
      const signResult: UploadSignResult = {
        host: "",
        body: {},
        attachment: {
          url: "",
          fileName: "",
          uploadType: "",
          fileMaxSize: 0,
        },
      };
      return signResult;
    },
    { auth: true },
  ),
);
