import OSS from "ali-oss";

import { BusinessErrorCode, UploadType } from "@rojer/mf-common";
import { BusinessError } from "../../lib/error";
import { logger } from "../../lib/logger";

import dayjs from "dayjs";
import { isString } from "lodash-es";
import { Readable } from "stream";
import { IUploadAdapter } from "./upload.adapter";

export class UploadOssAdapter extends IUploadAdapter {
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

    const client = new OSS({
      accessKeyId: setting.accessKeyId,
      accessKeySecret: setting.accessKeySecret,
      bucket: setting.bucket,
    });

    const policy = {
      expiration: dayjs().add(1, "hour").toISOString(), // 请求有效期
      conditions: [
        { bucket: setting.bucket },
        ["content-length-range", 0, maxSize], // 设置上传文件的大小限制
        ["eq", "$key", key],
        ["eq", "$success_action_status", "200"],
        ["in", "$content-type", [matchMime]],
      ],
    };

    const formData = client.calculatePostSignature(policy);

    const host = `//${setting.bucket}.${
      (await client.getBucketLocation(setting.bucket)).location
    }.aliyuncs.com`.toString();

    const url = `${setting.domain || `http:${host}`}/${key}`;

    return {
      host: host,
      body: {
        OSSAccessKeyId: formData.OSSAccessKeyId,
        policy: formData.policy,
        signature: formData.Signature,
        key: key,
        success_action_status: "200",
      },
      attachment: {
        url,
        fileName: filename,
        uploadType: UploadType.oss,
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

      console.log({
        region: setting.region,
        accessKeyId: setting.accessKeyId,
        accessKeySecret: setting.accessKeySecret,
        bucket: setting.bucket,
        authorizationV4: true,
      });

      const oss = new OSS({
        region: setting.region,
        accessKeyId: setting.accessKeyId,
        accessKeySecret: setting.accessKeySecret,
        bucket: setting.bucket,
        authorizationV4: true,
      });

      if (isString(file) || Buffer.isBuffer(file)) {
        await oss.put(key, file);
      } else if (file instanceof Readable) {
        // OSS bug,必须填一个contentlength才行
        // @ts-ignore
        await oss.putStream(key, file, {
          contentLength: (setting?.fileMaxSize ?? 15) * this.MB,
        });
      } else if (file instanceof File) {
        await oss.put(key, Buffer.from(await file.arrayBuffer()));
      } else {
        throw new BusinessError(BusinessErrorCode.UploadUnsupportFile);
      }

      const host = `//${setting.bucket}.${
        (await oss.getBucketLocation(setting.bucket)).location
      }.aliyuncs.com`.toString();

      const url = `${setting.domain || `http:${host}`}/${key}`;
      return { url, uploadType: UploadType.oss };
    } catch (error) {
      logger.error("保存本地文件失败", error);
      throw new BusinessError(BusinessErrorCode.UploadSaveFail, {
        message: (error as Error).message,
      });
    }
  }
}
