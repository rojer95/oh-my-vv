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
    ],
  },
] as const;
