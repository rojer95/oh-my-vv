export interface PermissionTreeNode {
  key: string;
  name: string;
  type: string;
  children?: readonly PermissionTreeNode[];
  loggable?: boolean;
  action?: string;
}
export const PERMISSION_TREE = [
  {
    key: "system",
    name: "系统管理",
    type: "menu",
    children: [
      {
        key: "config",
        name: "系统配置",
        type: "menu",
        children: [
          {
            key: "view",
            name: "查看配置",
            type: "button",
            loggable: false,
          },
          {
            key: "create",
            name: "新增配置",
            type: "button",
          },
          {
            key: "update",
            name: "修改配置",
            type: "button",
          },
          {
            key: "delete",
            name: "删除配置",
            type: "button",
          },
        ],
      },
      {
        key: "account",
        name: "账户管理",
        type: "menu",
        children: [
          {
            key: "view",
            name: "查看账户",
            type: "button",
            loggable: false,
          },
          {
            key: "create",
            name: "新增账户",
            type: "button",
          },
          {
            key: "update",
            name: "修改账户",
            type: "button",
          },
          {
            key: "delete",
            name: "删除账户",
            type: "button",
          },
          {
            key: "resetPassword",
            name: "重置密码",
            type: "button",
          },
        ],
      },
      {
        key: "role",
        name: "角色管理",
        type: "menu",
        children: [
          {
            key: "view",
            name: "查看角色",
            type: "button",
            loggable: false,
          },
          {
            key: "create",
            name: "新增角色",
            type: "button",
          },
          {
            key: "update",
            name: "修改角色",
            type: "button",
          },
          {
            key: "delete",
            name: "删除角色",
            type: "button",
          },
        ],
      },
      {
        key: "department",
        name: "部门管理",
        type: "menu",
        children: [
          {
            key: "view",
            name: "查看部门",
            type: "button",
            loggable: false,
          },
          {
            key: "create",
            name: "新增部门",
            type: "button",
          },
          {
            key: "update",
            name: "修改部门",
            type: "button",
          },
          {
            key: "delete",
            name: "删除部门",
            type: "button",
          },
        ],
      },
    ],
  },
] as const;
