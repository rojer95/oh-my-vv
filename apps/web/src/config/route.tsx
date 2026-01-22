import {
  MainLayout,
  PageError,
  RootElement,
  RootErrorPage,
} from "@/component/layout";
import { RouteObject, createHashRouter } from "react-router-dom";

import { AttachmentPage } from "../page/attachment";
import { AdminPage } from "../page/config/auth/admin";
import { OplogPage } from "../page/config/auth/oplog";
import { RolePage } from "../page/config/auth/role";
import { DictPage } from "../page/config/dict/dict";
import { SettingSystemPage } from "../page/config/setting/system";
import { SettingUploadPage } from "../page/config/setting/upload";
import { SystemConfigPage } from "../page/config/system-config";
import { SystemAccountPage } from "../page/system/account";
import { LoginPage } from "../page/login";

import { MerchantListPage } from "../page/merchant/list";
import { ProfileInfoPage } from "../page/profile/info";
import { DashboardPage } from "../page/statistic/dashboard";
import { PERMISSIONS } from "@rojer/mf-common";

/**
 * 路由handle附加数据定义
 */
export type RouteExtraHandle = {
  menu?: string; // 菜单名称，如果设置则表示这是一个菜单
  access?: string; // 访问权限，如果设置则表示拥有这个权限才能访问这个页面
};

const mainRoute: RouteObject[] = [
  /**
  {
    path: "profile",
    element: <ProfileInfoPage />,
  },
   */
  {
    path: "",
    handle: {
      menu: "首页",
    },
    children: [
      {
        path: "dashboard",
        element: <DashboardPage text="👏🏻 欢迎您使用~" />,
        handle: {
          menu: "首页",
        },
      },
    ],
  },

  {
    path: "system",
    handle: {
      menu: "系统",
    },
    children: [
      /**

      {
        path: "merchant",
        element: <MerchantListPage />,
        handle: {
          menu: "商户管理",
          access: "merchant.read",
        },
      },

      {
        path: "dict",
        handle: {
          menu: "数据字典",
          access: "dict.read",
        },
        element: <DictPage />,
      },

      {
        path: "attachment",
        handle: {
          menu: "素材库",
        },
        element: <AttachmentPage />,
      },

      {
        path: "auth",
        handle: {
          menu: "权限&账户",
        },
        children: [
          {
            path: "admin",
            handle: {
              menu: "账号",
              access: "admin.read",
            },
            element: <AdminPage />,
          },

          {
            path: "role",
            handle: {
              menu: "角色",
              access: "role.read",
            },
            element: <RolePage />,
          },

          {
            path: "oplog",
            handle: {
              menu: "操作日志",
              access: "oplog.read",
            },
            element: <OplogPage />,
          },
        ],
      },
   */

      {
        path: "config",
        handle: {
          menu: "系统配置",
          access: PERMISSIONS.systemConfigView.key,
        },
        element: <SystemConfigPage />,
      },

      {
        path: "account",
        handle: {
          menu: "账户管理",
          access: PERMISSIONS.systemAccountView.key,
        },
        element: <SystemAccountPage />,
      },
    ],
  },
];

const routes: RouteObject[] = [
  {
    errorElement: <RootErrorPage />,
    element: <RootElement />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
      {
        element: <MainLayout />,
        errorElement: <PageError />,
        children: mainRoute,
        handle: {
          mainRoute: true,
        },
      },
    ],
  },
];

export const router = createHashRouter(routes);
