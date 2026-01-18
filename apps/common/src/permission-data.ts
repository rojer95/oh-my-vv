export const PERMISSION_TREE = [
  {
    key: "system",
    name: "系统管理",
    type: "menu",
    children: [
      {
        key: "user",
        name: "用户管理",
        type: "menu",
        children: [
          {
            key: "view",
            name: "查看用户",
            type: "button",
          },
          {
            key: "add",
            name: "添加用户",
            type: "button",
          },
          {
            key: "edit",
            name: "编辑用户",
            type: "button",
          },
          {
            key: "delete",
            name: "删除用户",
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
          },
          {
            key: "add",
            name: "添加角色",
            type: "button",
          },
          {
            key: "edit",
            name: "编辑角色",
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
        key: "permission",
        name: "权限管理",
        type: "menu",
        children: [
          {
            key: "view",
            name: "查看权限",
            type: "button",
          },
        ],
      },
    ],
  },
] as const;
