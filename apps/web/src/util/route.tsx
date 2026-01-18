import { SubNavPropsWithItems } from "@douyinfe/semi-ui/lib/es/navigation";
import { ProfileType } from "@rojer/mf-common";
import { RouteObject } from "react-router-dom";
import { checkAccess } from "./access";

export const getPathname = (i: any) => {
  if (!i) return undefined;
  let pathname = i?.pathname;
  if (pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  return pathname;
};

export const getMenuFromRoute = (
  routes: RouteObject[],
  routePrefix: string[] = [],
): SubNavPropsWithItemsWithHandle[] => {
  const menus: any[] = routes
    .filter((i: RouteObject) => {
      if (!i.handle?.menu) return false;
      return true;
    })
    .map((i: RouteObject) => {
      const paths = [...routePrefix, i.path].filter((i) => i);
      const items = getMenuFromRoute(i.children || [], paths as string[]);
      const itemKey = ["", ...paths].join("/");
      return {
        itemKey,
        text: i.handle?.menu,
        items,
        handle: i.handle,
      };
    });
  return menus;
};

/**
 * 从route解析出与当前登录用户匹配的菜单
 * @param routes 路由定义
 * @param routePrefix 前缀
 * @param profile 用户信息
 * @returns
 */
export const filterMenuByProfile = (
  menus: SubNavPropsWithItemsWithHandle[],
  profile?: ProfileType,
): SubNavPropsWithItemsWithHandle[] => {
  if (!profile || !profile.permissions) return [];

  const userMenus: any[] = menus
    // 过滤权限
    .filter((i: SubNavPropsWithItemsWithHandle) => {
      return checkAccess(i.handle?.access, profile.permissions);
    })
    .map((i: SubNavPropsWithItems) => {
      let subMenus: any[] = [];
      if (i.items && i.items.length > 0) {
        subMenus = filterMenuByProfile(i.items || [], profile);
        if (subMenus.length === 0) return false;
      }

      // 如果子菜单都没用权限，则隐藏父菜单
      return {
        ...i,
        items: subMenus,
      };
    })
    // 过滤掉无权限的
    .filter((i) => i !== false);

  return userMenus;
};

/**
 * DFS 搜索匹配路由 返回路径
 * @param menus
 * @param pathname
 * @returns
 */
export const findRoute = (
  routes: RouteObject[],
  filter: (route: RouteObject) => boolean,
): RouteObject | null => {
  const stack: any = [];

  stack.push({
    path: "/",
    children: routes,
  });

  do {
    const current: RouteObject = stack.pop();
    if (filter(current)) return current;
    if (current.children && current.children.length > 0) {
      for (let i = current.children.length - 1; i >= 0; i--) {
        stack.push(current.children[i]);
      }
    }
  } while (stack.length > 0);

  return null;
};
