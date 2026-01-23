import { Toast } from "@douyinfe/semi-ui";
import { treaty } from "@elysiajs/eden";
import { STORAGE_AUTH_KEY } from "@rojer/mf-common";
import type { App } from "../../api/src/index";

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
  onResponse: async (response) => {
    const data = await response.json();
    if (data.code === 0) return data.data;
    Toast.error(data.message);
    throw new Error(data.message);
  },
});

const createProxy = (target: any): any => {
  return new Proxy(target, {
    get(innerTarget: any, prop: string | symbol) {
      const value = Reflect.get(innerTarget, prop);

      if (
        ["get", "post", "put", "delete"].includes(
          prop.toString().toLocaleLowerCase(),
        )
      ) {
        return async (...args: any) => {
          const { data, error } = await value(...args);
          if (error) {
            throw error.value;
          }
          return data;
        };
      }
      return createProxy(value);
    },
  });
};

export const api = createProxy(treatyApi);
