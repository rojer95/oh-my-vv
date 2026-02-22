import { BusinessErrorCode, UploadType } from "@rojer/mf-common";
import { BusinessError } from "../../lib/error";
import { UploadCosAdapter } from "./upload-cos.adapter";
import { UploadLocalAdapter } from "./upload-local.adapter";
import { UploadOssAdapter } from "./upload-oss.adapter";
import { UploadQiniuAdapter } from "./upload-qiniu.adapter";
import { IUploadAdapter } from "./upload.adapter";

// 适配器工厂类
export class UploadAdapterFactory {
  private static adapters: Map<UploadType, IUploadAdapter> = new Map();

  // 从配置初始化工厂
  static initialize(): void {
    for (const type of Object.values(UploadType)) {
      if (this.adapters.has(type)) continue;
      const adapter = this.createAdapter(type);
      this.adapters.set(type, adapter);
    }
  }

  // 创建单个适配器
  private static createAdapter(type: UploadType): IUploadAdapter {
    switch (type) {
      case UploadType.local:
        return new UploadLocalAdapter();
      case UploadType.oss:
        return new UploadOssAdapter();
      case UploadType.qiniu:
        return new UploadQiniuAdapter();
      case UploadType.cos:
        return new UploadCosAdapter();
      default:
        throw new BusinessError(BusinessErrorCode.UploadUnsupportType);
    }
  }

  // 获取适配器
  static getAdapter(type?: UploadType): IUploadAdapter {
    if (!type) {
      throw new BusinessError(BusinessErrorCode.UploadUnsupportType);
    }

    const adapter = this.adapters.get(type);
    if (!adapter) {
      throw new BusinessError(BusinessErrorCode.UploadUnsupportType);
    }

    return adapter;
  }
}
