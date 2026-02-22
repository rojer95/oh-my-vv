import COS from "cos-nodejs-sdk-v5";
import crypto from "crypto";

import { BusinessErrorCode, UploadType } from "@rojer/mf-common";
import { BusinessError } from "../../lib/error";
import { logger } from "../../lib/logger";

import dayjs from "dayjs";
import { isString } from "lodash-es";
import { Readable } from "stream";
import { IUploadAdapter } from "./upload.adapter";

export class UploadCosAdapter extends IUploadAdapter {
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

    // 配置参数
    const qSignAlgorithm = "sha1";

    const now = Math.round(Date.now() / 1000);
    const exp = now + 900;
    const qKeyTime = now + ";" + exp;

    const policy = JSON.stringify({
      expiration: dayjs().add(1, "hour").toISOString(),
      conditions: [
        ["eq", "q-sign-algorithm", qSignAlgorithm],
        ["eq", "q-ak", setting.secretId],
        ["eq", "q-sign-time", qKeyTime],
        ["eq", "bucket", setting.bucket],
        ["eq", "$Content-Type", matchMime],
        ["eq", "key", key],
        ["content-length-range", 0, maxSize], // 设置上传文件的大小限制
      ],
    });

    // 步骤一：生成 SignKey
    const signKey = crypto
      .createHmac("sha1", setting.secretKey)
      .update(qKeyTime)
      .digest("hex");

    // 步骤二：生成 StringToSign
    const stringToSign = crypto.createHash("sha1").update(policy).digest("hex");

    // 步骤三：生成 Signature
    const qSignature = crypto
      .createHmac("sha1", signKey)
      .update(stringToSign)
      .digest("hex");

    const host =
      `//${setting.bucket}.cos.${setting.region}.myqcloud.com`.toString();

    const url = `${setting.domain || `http:${host}`}/${key}`;

    return {
      host: host,
      body: {
        "q-sign-algorithm": qSignAlgorithm,
        "q-ak": setting.secretId,
        "q-key-time": qKeyTime,
        "q-signature": qSignature,
        policy: Buffer.from(policy).toString("base64"),
        key,
        success_action_status: "200",
        "Content-Type": matchMime,
      },
      attachment: {
        url,
        fileName: filename,
        uploadType: UploadType.cos,
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

      const cos = new COS({
        SecretId: setting.secretId, // 推荐使用环境变量获取；用户的 SecretId，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://cloud.tencent.com/document/product/598/37140
        SecretKey: setting.secretKey, // 推荐使用环境变量获取；用户的 SecretKey，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://cloud.tencent.com/document/product/598/37140
      });

      if (isString(file) || Buffer.isBuffer(file) || file instanceof Readable) {
        await cos.putObject({
          Bucket: setting.bucket,
          Region: setting.region,
          Key: key,
          Body: file,
        });
      } else if (file instanceof File) {
        await cos.putObject({
          Bucket: setting.bucket,
          Region: setting.region,
          Key: key,
          Body: Buffer.from(await file.arrayBuffer()),
        });
      } else {
        throw new BusinessError(BusinessErrorCode.UploadUnsupportFile);
      }

      const host =
        `//${setting.bucket}.cos.${setting.region}.myqcloud.com`.toString();
      const url = `${setting.domain || `http:${host}`}/${key}`;
      return {
        url,
        uploadType: UploadType.cos,
      };
    } catch (error) {
      logger.error("保存本地文件失败", error);
      throw new BusinessError(BusinessErrorCode.UploadSaveFail, {
        message: (error as Error).message,
      });
    }
  }
}
