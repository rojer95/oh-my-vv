import qiniu from "qiniu";

import { BusinessErrorCode, UploadType } from "@rojer/mf-common";
import { BusinessError } from "../../lib/error";
import { logger } from "../../lib/logger";

import { isString } from "lodash-es";
import { Readable } from "stream";
import { IUploadAdapter } from "./upload.adapter";

export class UploadQiniuAdapter extends IUploadAdapter {
  async sign(
    tenantId: number,
    filename: string,
    filesize: number,
    setting: any,
  ) {
    const { key, matchMime, maxSize } = await this.signPreProcessing(
      tenantId,
      filename,
      filesize,
      setting,
    );

    const mac = new qiniu.auth.digest.Mac(setting?.ak, setting?.sk);

    const options = {
      scope: `${setting?.bucket}:${key}`,
      expires: setting.timeout,
      mimeLimit: matchMime || undefined,
      fsizeLimit: maxSize,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);

    const url = `${setting.domain}/${key}`;

    return {
      host: `//${(qiniu.zone as any)[`Zone_${setting.zone}`].cdnUpHosts?.[0]}`,
      body: {
        token: putPolicy.uploadToken(mac),
        key,
      },
      attachment: {
        url,
        fileName: filename,
        uploadType: UploadType.qiniu,
        fileMaxSize: maxSize,
      },
    };
  }

  async save(
    file: File | string | Readable | Buffer,
    payload: {
      key: string;
    },
    setting: any,
  ) {
    try {
      const { key } = payload;

      const config = new qiniu.conf.Config();
      const formUploader = new qiniu.form_up.FormUploader(config);
      const putExtra = new qiniu.form_up.PutExtra();

      const mac = new qiniu.auth.digest.Mac(setting?.ak, setting?.sk);

      const options = {
        scope: `${setting?.bucket}:${key}`,
      };

      const putPolicy = new qiniu.rs.PutPolicy(options);
      const uploadToken = putPolicy.uploadToken(mac);

      if (isString(file)) {
        await formUploader.putFile(uploadToken, key, file, putExtra);
      } else if (Buffer.isBuffer(file)) {
        await formUploader.put(uploadToken, key, file, putExtra);
      } else if (file instanceof Readable) {
        await formUploader.putStream(uploadToken, key, file, putExtra);
      } else if (file instanceof File) {
        await formUploader.put(
          uploadToken,
          key,
          Buffer.from(await file.arrayBuffer()),
          putExtra,
        );
      } else {
        throw new BusinessError(BusinessErrorCode.UploadUnsupportFile);
      }

      const url = `${setting.domain}/${key}`;
      return { url, uploadType: UploadType.qiniu };
    } catch (error) {
      logger.error("保存本地文件失败", error);
      throw new BusinessError(BusinessErrorCode.UploadSaveFail, {
        message: (error as Error).message,
      });
    }
  }
}
