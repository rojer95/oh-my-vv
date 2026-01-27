import type { AccountType } from "./enum";

export type Permission = {
  key: string;
  name: string;
};

export type ProfileType = {
  /** 用户id */
  id?: number;

  /** 账号类型 */
  accountType?: string;

  /** 账号拥有的权限集 */
  permissions?: string[];

  /** 名称 */
  realName?: string;

  /** 邮箱 */
  mail?: string;

  /** 商户ID */
  tenantId?: number;

  /** 商户信息 */
  tenant?: {
    id?: number;
    name?: string;
  };

  /** 是否有多重认证 */
  totp?: boolean;
};

export type UploadSignResult = {
  host: string;
  body: Record<string, any>;
  attachment: {
    url: string;
    fileName: string;
    uploadType: string;
    fileMaxSize: number;
  };
};

export type AuthValidateType = "hasPermi" | "lacksPermi" | "hasAnyPermi";
