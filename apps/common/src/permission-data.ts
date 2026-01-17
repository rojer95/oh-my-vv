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
            action: "查看用户列表",
            loggable: true,
          },
          {
            key: "add",
            name: "添加用户",
            type: "button",
            action: "添加新用户",
            loggable: true,
          },
          {
            key: "edit",
            name: "编辑用户",
            type: "button",
            action: "编辑用户信息",
            loggable: true,
          },
          {
            key: "delete",
            name: "删除用户",
            type: "button",
            action: "删除用户",
            loggable: true,
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
            action: "查看角色列表",
            loggable: true,
          },
          {
            key: "add",
            name: "添加角色",
            type: "button",
            action: "添加新角色",
            loggable: true,
          },
          {
            key: "edit",
            name: "编辑角色",
            type: "button",
            action: "编辑角色信息",
            loggable: true,
          },
          {
            key: "delete",
            name: "删除角色",
            type: "button",
            action: "删除角色",
            loggable: true,
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
            action: "查看权限树",
            loggable: true,
          },
        ],
      },
    ],
  },
] as const;
