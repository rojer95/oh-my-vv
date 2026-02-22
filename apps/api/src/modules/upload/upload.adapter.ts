import dayjs from "dayjs";
import mime from "mime";
import { nanoid } from "nanoid";
import path from "path";

import { BusinessErrorCode, UploadSignResult } from "@rojer/mf-common";
import { BusinessError } from "../../lib/error";
import { Readable } from "stream";

export abstract class IUploadAdapter {
  protected MB = 1024 * 1024;

  protected settingKey = "upload:setting";

  /**
   * 获取文件后缀
   * @param filename
   * @returns
   */
  protected getExt(filename: string) {
    return path.extname(filename).toLocaleLowerCase();
  }

  /**
   * 获取文件key
   * @param tenantId
   * @param ext
   * @param prefix
   * @returns
   */
  protected getKey(tenantId: number, ext: string, prefix?: string) {
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
  protected matchMime(allowExts: string, ext: string) {
    const match = (allowExts || "")
      .split(",")
      .map((i) => i.trim())
      .filter((i) => !!i)
      .some((i) => i.toLocaleLowerCase() === ext);
    if (!match) throw new BusinessError(BusinessErrorCode.UploadUnsupportExt);
    return mime.getType(ext.slice(1));
  }

  /**
   * 签名预处理
   * @param filename
   * @param filesize
   * @returns
   */
  protected async signPreProcessing(
    tenantId: number,
    filename: string,
    filesize: number,
    setting: any,
  ): Promise<{
    key: string;
    matchMime: string | null;
    maxSize: number;
  }> {
    const fileMaxSize = setting.fileMaxSize ?? 5;
    const maxSize = fileMaxSize * this.MB;
    if (filesize > maxSize) {
      throw new BusinessError(BusinessErrorCode.UploadMaxsize, {
        size: fileMaxSize,
      });
    }

    const ext = this.getExt(filename);
    const matchMime = this.matchMime(setting.allowExts, ext);
    const key = this.getKey(tenantId, ext, setting?.prefix);

    return { key, matchMime, maxSize };
  }

  abstract sign(
    tenantId: number,
    filename: string,
    filesize: number,
    setting: any,
  ): Promise<UploadSignResult>;

  abstract save(
    file: File | string | Readable | Buffer,
    payload: {
      key: string;
      mimeLimit?: string;
      fsizeLimit?: number;
    },
    setting: any,
  ): Promise<Partial<UploadSignResult["attachment"]>>;
}
