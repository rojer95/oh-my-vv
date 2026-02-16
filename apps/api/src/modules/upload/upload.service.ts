import OSS from "ali-oss";
import crypto from "crypto";
import dayjs from "dayjs";
import fs from "fs";
import mime from "mime";
import { nanoid } from "nanoid";
import path from "path";
import qiniu from "qiniu";

import {
  BusinessErrorCode,
  UploadSignResult,
  UploadType,
} from "@rojer/mf-common";
import { fileType } from "elysia";
import { BusinessError } from "../../lib/error";
import { logger } from "../../lib/logger";
import { redis } from "../../lib/redis";

export abstract class UploadService {
  static MB = 1024 * 1024;

  static settingKey = "upload:setting";
  static async saveSetting(setting: any) {
    await redis.set(this.settingKey, JSON.stringify(setting));
  }

  static async getSetting() {
    try {
      const settingStr = await redis.get(this.settingKey);
      if (!settingStr)
        throw new BusinessError(BusinessErrorCode.UploadUnactive);
      return JSON.parse(settingStr);
    } catch (error) {
      throw new BusinessError(BusinessErrorCode.UploadUnactive);
    }
  }

  /**
   * 获取文件后缀
   * @param filename
   * @returns
   */
  static getExt(filename: string) {
    return path.extname(filename).toLocaleLowerCase();
  }

  /**
   * 获取文件key
   * @param tenantId
   * @param ext
   * @param prefix
   * @returns
   */
  static getKey(tenantId: number, ext: string, prefix?: string) {
    return `${prefix || ""}m${tenantId}/${dayjs().format(
      "YYYYMMDD",
    )}/${nanoid()}${ext}`;
  }

  /**
   * 匹配文件mime
   * @param allowExts
   * @param ext
   * @returns
   */
  static matchMime(allowExts: string, ext: string) {
    const match = (allowExts || "")
      .split(",")
      .map((i) => i.trim())
      .filter((i) => !!i)
      .some((i) => i.toLocaleLowerCase() === ext);
    if (!match) throw new BusinessError(BusinessErrorCode.UploadUnsupportExt);
    return mime.getType(ext.slice(1));
  }

  /**
   * 签名
   * @param filename
   * @param filesize
   * @returns
   */
  static async sign(
    tenantId: number,
    filename: string,
    filesize: number,
  ): Promise<UploadSignResult> {
    const setting = await this.getSetting();

    const fileMaxSize = setting.fileMaxSize ?? 5;
    const maxSize = fileMaxSize * this.MB;
    if (filesize > maxSize) {
      throw new BusinessError(BusinessErrorCode.UploadMaxsize, {
        size: fileMaxSize,
      });
    }

    const ext = this.getExt(filename);
    const matchMime = this.matchMime(setting.allowExts, ext);
    const key = this.getKey(tenantId, ext, setting?.[setting?.type]?.prefix);

    switch (setting.type) {
      case UploadType.qiniu:
        return await this.signQiniu(
          key,
          setting.qiniu,
          filename,
          matchMime,
          maxSize,
        );

      case UploadType.cos:
        return await this.signCos(
          key,
          setting.cos,
          filename,
          matchMime,
          maxSize,
        );

      case UploadType.oss:
        return await this.signOss(
          key,
          setting.oss,
          filename,
          matchMime,
          maxSize,
        );

      case UploadType.local:
        return await this.signLocal(
          key,
          setting.local,
          filename,
          matchMime,
          maxSize,
        );
    }

    throw new BusinessError(BusinessErrorCode.UploadUnsupportType);
  }

  /**
   * 七牛签名
   * @param setting
   * @param filename
   * @param filesize
   * @returns
   */
  static async signQiniu(
    key: string,
    setting: any,
    filename: string,
    matchMime: string | null,
    maxSize: number,
  ): Promise<UploadSignResult> {
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

  /**
   * 阿里云OSS
   * @param key
   * @param setting
   * @param filename
   * @param matchMime
   * @param maxSize
   * @returns
   */
  static async signOss(
    key: string,
    setting: any,
    filename: string,
    matchMime: string | null,
    maxSize: number,
  ): Promise<UploadSignResult> {
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

  /**
   * 腾讯云COS上传
   * @param key
   * @param setting
   * @param filename
   * @param matchMime
   * @param maxSize
   * @returns
   */
  static async signCos(
    key: string,
    setting: any,
    filename: string,
    matchMime: string | null,
    maxSize: number,
  ): Promise<UploadSignResult> {
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

  static async signLocal(
    key: string,
    setting: any,
    filename: string,
    matchMime: string | null,
    maxSize: number,
  ) {
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

  static async saveLocal(
    file: File,
    payload: {
      key: string;
      mimeLimit: string;
      fsizeLimit: number;
    },
  ) {
    try {
      const { key, mimeLimit, fsizeLimit } = payload;

      if (!(await fileType(file, mimeLimit))) {
        throw new BusinessError(BusinessErrorCode.UploadUnsupportMime);
      }

      const size = file.size;
      if (size > fsizeLimit) {
        throw new BusinessError(BusinessErrorCode.UploadMaxsize, {
          size: Number(fsizeLimit / this.MB).toFixed(2),
        });
      }

      fs.writeFileSync(
        path.join(__dirname, "../../../public", key),
        Buffer.from(await file.arrayBuffer()),
      );

      return { ok: 1 };
    } catch (error) {
      logger.error("保存本地文件失败", error);
      throw new BusinessError(BusinessErrorCode.SystemIllegal);
    }
  }
}
