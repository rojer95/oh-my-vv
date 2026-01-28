import { AccountType } from "./enum";

export interface PermissionTreeNode {
  key: string;
  name: string;
  children?: readonly PermissionTreeNode[];
  accountType?: readonly AccountType[];
}

export const PERMISSION_TREE = [
  {
    key: "system",
    name: "系统管理",
    children: [
      {
        key: "config",
        name: "系统配置",
        children: [
          {
            key: "view",
            name: "查看配置",
            accountType: [AccountType.platform],
          },
          {
            key: "create",
            name: "新增配置",
            accountType: [AccountType.platform],
          },
          {
            key: "update",
            name: "修改配置",
            accountType: [AccountType.platform],
          },
          {
            key: "delete",
            name: "删除配置",
            accountType: [AccountType.platform],
          },
        ],
      },
      {
        key: "account",
        name: "账户管理",
        children: [
          {
            key: "view",
            name: "查看账户",
          },
          {
            key: "create",
            name: "新增账户",
          },
          {
            key: "update",
            name: "修改账户",
          },
          {
            key: "delete",
            name: "删除账户",
          },
          {
            key: "resetPassword",
            name: "重置密码",
          },
        ],
      },
      {
        key: "role",
        name: "角色管理",
        children: [
          {
            key: "view",
            name: "查看角色",
          },
          {
            key: "create",
            name: "新增角色",
          },
          {
            key: "update",
            name: "修改角色",
          },
          {
            key: "delete",
            name: "删除角色",
          },
        ],
      },
      {
        key: "department",
        name: "部门管理",
        children: [
          {
            key: "view",
            name: "查看部门",
          },
          {
            key: "create",
            name: "新增部门",
          },
          {
            key: "update",
            name: "修改部门",
          },
          {
            key: "delete",
            name: "删除部门",
          },
        ],
      },
    ],
  },
] as const;
