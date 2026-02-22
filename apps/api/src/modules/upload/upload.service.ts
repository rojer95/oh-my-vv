import {
  BusinessErrorCode,
  UploadSignResult,
  UploadType,
} from "@rojer/mf-common";
import { pick } from "lodash-es";
import { BusinessError } from "../../lib/error";
import { redis } from "../../lib/redis";
import { UploadAdapterFactory } from "./upload.factory";
import { Readable } from "stream";

UploadAdapterFactory.initialize();

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
    const allSetting = await this.getSetting();
    if (!allSetting || !allSetting?.type || !allSetting?.[allSetting?.type]) {
      throw new BusinessError(BusinessErrorCode.UploadUnactive);
    }
    const setting = {
      ...pick(allSetting, ["fileMaxSize", "allowExts", "type"]),
      ...allSetting[allSetting.type],
    };
    const uploadAdapter = UploadAdapterFactory.getAdapter(setting.type);
    return await uploadAdapter.sign(tenantId, filename, filesize, setting);
  }

  static async upload(
    file: File | string | Buffer | Readable,
    payload: {
      key: string;
      mimeLimit?: string;
      fsizeLimit?: number;
    },
  ) {
    const allSetting = await this.getSetting();
    if (!allSetting || !allSetting?.type || !allSetting?.[allSetting?.type]) {
      throw new BusinessError(BusinessErrorCode.UploadUnactive);
    }
    const setting = {
      ...pick(allSetting, ["fileMaxSize", "allowExts", "type"]),
      ...allSetting[allSetting.type],
    };
    const uploadAdapter = UploadAdapterFactory.getAdapter(setting.type);
    return await uploadAdapter.save(file, payload, setting);
  }

  static async uploadLocal(
    file: File,
    payload: {
      key: string;
      mimeLimit: string;
      fsizeLimit: number;
    },
  ) {
    const allSetting = await this.getSetting();
    if (!allSetting || !allSetting?.local) {
      throw new BusinessError(BusinessErrorCode.UploadUnactive);
    }
    const setting = {
      ...pick(allSetting, ["fileMaxSize", "allowExts", "type"]),
      ...allSetting?.local,
    };
    const uploadAdapter = UploadAdapterFactory.getAdapter(UploadType.local);
    return await uploadAdapter.save(file, payload, setting);
  }
}
