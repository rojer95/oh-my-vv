import { PERMISSIONS, UPLOAD_JWT_ISSUER, UploadType } from "@rojer/mf-common";
import { Elysia, t } from "elysia";
import z from "zod";
import { authPlugin } from "../../lib/auth";
import { curdPlugin } from "../../lib/curd";
import { UploadService } from "./upload.service";
import { UploadDto, UploadSettingDto } from "./upload.dto";

export const uploadController = new Elysia()
  .use(curdPlugin)
  .use(authPlugin)

  .group("upload", (app) =>
    app
      /** 获取配置 */
      .get(
        "/setting",
        async () => {
          return await UploadService.getSetting();
        },
        {
          auth: { permission: PERMISSIONS.systemUploadView, loggable: false },
        },
      )
      /** 更新配置 */
      .put(
        "/setting",
        async ({ body }) => {
          await UploadService.saveSetting(body);
        },
        {
          auth: PERMISSIONS.systemUploadUpdate,
          body: UploadSettingDto,
        },
      )
      /** 上传签名 */
      .post(
        "/sign",
        async ({ tenantId, body, jwt }) => {
          const res = await UploadService.sign(
            tenantId,
            body.filename,
            body.filesize,
          );

          if (res.attachment.uploadType === UploadType.local) {
            res.body.token = await jwt.sign(
              res.body.token,
              UPLOAD_JWT_ISSUER,
              "30m",
            );
          }

          return res;
        },
        {
          auth: true,
          body: UploadDto,
        },
      )

      /** 本地上传 */
      .post(
        "/local",
        async ({ body, jwt }) => {
          const uploadPayload = await jwt.decode<{
            key: string;
            mimeLimit: string;
            fsizeLimit: number;
          }>(body.token, UPLOAD_JWT_ISSUER);
          return await UploadService.saveLocal(body.file, uploadPayload);
        },
        {
          body: t.Object({
            file: t.File(),
            token: t.String(),
            key: t.String(),
          }),
        },
      ),
  );
