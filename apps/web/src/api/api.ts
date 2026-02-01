import { adminModel } from "@/mobx/admin";
import { Toast } from "@douyinfe/semi-ui";
import { treaty } from "@elysiajs/eden";
import { STORAGE_AUTH_KEY } from "@rojer/mf-common";
import type { App } from "../../../api/src/index";
import type { MyEdenTreaty } from "./type";

export const treatyApi = treaty<App>(import.meta.env.VITE_API as string, {
  onRequest: () => {
    const token =
      localStorage[STORAGE_AUTH_KEY] ?? sessionStorage[STORAGE_AUTH_KEY];
    if (token) {
      return {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
    }
  },
});

const createProxy = (target: any): MyEdenTreaty.Create<App> => {
  return new Proxy(target, {
    get(innerTarget: any, prop: string | symbol) {
      const value = Reflect.get(innerTarget, prop);
      if (
        ["get", "post", "put", "delete"].includes(
          prop.toString().toLocaleLowerCase(),
        )
      ) {
        return async (...args: any) => {
          const res = await value(...args);
          const { data, error } = res;
          if (data.code !== 0 || error) {
            Toast.error(data?.message || error?.message);
            if (data.code === 401) adminModel.logout();
            throw new Error(data.message || error?.message);
          }

          return data.data;
        };
      }

      return createProxy(value);
    },
    // 处理函数调用（当代理对象本身被调用时）
    apply(target: any, thisArg: any, args: any[]) {
      const result = Reflect.apply(target, thisArg, args);
      return createProxy(result);
    },
  });
};

export const api = createProxy(treatyApi);
