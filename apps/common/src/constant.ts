import { RoleDataPermType } from "./enum";

export const STORAGE_AUTH_KEY = "AUTH_KEY";
export const PASSWORD_PATTERN =
  /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]/;

export const RoleDataPermTypeOptions = [
  { label: "全部数据", value: RoleDataPermType.all },
  { label: "用户所在部门", value: RoleDataPermType.department },
  { label: "用户所在及以下部门", value: RoleDataPermType.departments },
  { label: "自定义部门", value: RoleDataPermType.custom },
  { label: "仅用户本人数据", value: RoleDataPermType.user },
];
