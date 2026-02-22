import {
  MainLayout,
  PageError,
  RootElement,
  RootErrorPage,
} from "@/component/layout";
import { RouteObject, createHashRouter } from "react-router-dom";

import { PERMISSIONS } from "@rojer/mf-common";
import { LoginPage } from "../page/login";
import { ProfileInfoPage } from "../page/profile/info";
import { DashboardPage } from "../page/statistic/dashboard";
import { SystemAccountPage } from "../page/system/account";
import { SystemConfigPage } from "../page/system/config";
import { UploadConfigPage } from "../page/system/config/upload";
import { DepartmentPage } from "../page/system/department";
import { DictPage } from "../page/system/dict/dict";
import { RolePage } from "../page/system/role";

/**
 * 路由handle附加数据定义
 */
export type RouteExtraHandle = {
  menu?: string; // 菜单名称，如果设置则表示这是一个菜单
  access?: string; // 访问权限，如果设置则表示拥有这个权限才能访问这个页面
};

const mainRoute: RouteObject[] = [
  {
    path: "profile",
    element: <ProfileInfoPage />,
  },
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
        path: "auth",
        handle: {
          menu: "权限&账户",
        },
        children: [
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
        path: "setting",
        handle: {
          menu: "配置管理",
        },
        children: [
          {
            path: "system",
            handle: {
              menu: "系统配置",
              access: PERMISSIONS.systemConfigView.key,
            },
            element: <SystemConfigPage />,
          },
          {
            path: "upload",
            handle: {
              menu: "上传配置",
              access: PERMISSIONS.systemUploadView.key,
            },
            element: <UploadConfigPage />,
          },
          {
            path: "dict",
            handle: {
              menu: "数据字典",
              access: PERMISSIONS.systemDictView.key,
            },
            element: <DictPage />,
          },
        ],
      },

      {
        path: "auth",
        handle: {
          menu: "权限&账户",
        },
        children: [
          {
            path: "account",
            handle: {
              menu: "账户管理",
              access: PERMISSIONS.systemAccountView.key,
            },
            element: <SystemAccountPage />,
          },
          {
            path: "role",
            handle: {
              menu: "角色管理",
              access: PERMISSIONS.systemRoleView.key,
            },
            element: <RolePage />,
          },
          {
            path: "department",
            handle: {
              menu: "部门管理",
              access: PERMISSIONS.systemDepartmentView.key,
            },
            element: <DepartmentPage />,
          },
        ],
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
