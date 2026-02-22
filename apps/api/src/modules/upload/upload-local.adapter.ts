import fs from "fs";
import path from "path";

import { BusinessErrorCode, UploadType } from "@rojer/mf-common";
import { fileType } from "elysia";
import { BusinessError } from "../../lib/error";
import { logger } from "../../lib/logger";

import { IUploadAdapter } from "./upload.adapter";

export class UploadLocalAdapter extends IUploadAdapter {
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

    const domain = setting.domain;

    const options = {
      key,
      mimeLimit: matchMime,
      fsizeLimit: maxSize,
      t: new Date().valueOf(),
    };

    const dir = path.join(
      __dirname,
      "../../../public",
      key.slice(0, key.lastIndexOf("/")),
    );

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const url = `${domain}/public/${key}`;

    return {
      host: `${domain}/api/v1/upload/local`,
      body: {
        token: options,
        key,
      },
      attachment: {
        url,
        fileName: filename,
        uploadType: UploadType.local,
        fileMaxSize: maxSize,
      },
    };
  }

  async save(
    file: File,
    payload: {
      key: string;
      mimeLimit?: string;
      fsizeLimit?: number;
    },
    setting: any,
  ) {
    try {
      const { key, mimeLimit, fsizeLimit } = payload;
      if (
        mimeLimit &&
        mimeLimit !== "image/svg+xml" &&
        !(await fileType(file, mimeLimit))
      ) {
        throw new BusinessError(BusinessErrorCode.UploadUnsupportMime);
      }

      if (mimeLimit && file.type !== mimeLimit) {
        throw new BusinessError(BusinessErrorCode.UploadUnsupportMime);
      }

      if (fsizeLimit && file.size > fsizeLimit) {
        throw new BusinessError(BusinessErrorCode.UploadMaxsize, {
          size: Number(fsizeLimit / this.MB).toFixed(2),
        });
      }
      if (file instanceof File) {
        fs.writeFileSync(
          path.join(__dirname, "../../../public", key),
          Buffer.from(await file.arrayBuffer()),
        );
      } else {
        throw new BusinessError(BusinessErrorCode.UploadUnsupportFile);
      }

      const domain = setting.domain;
      const url = `${domain}/public/${key}`;
      return {
        url,
        uploadType: UploadType.local,
      };
    } catch (error) {
      logger.error("保存本地文件失败", error);
      throw new BusinessError(BusinessErrorCode.UploadSaveFail, {
        message: (error as Error).message,
      });
    }
  }
}
