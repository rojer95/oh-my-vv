import { Elysia } from "elysia";
import { UploadSignResult } from "@rojer/mf-common";
import { authPlugin } from "../../lib/auth";

export const uploadController = new Elysia()
  .use(authPlugin)
  .group("upload", (app) =>
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
