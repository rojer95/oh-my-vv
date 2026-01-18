import { STORAGE_AUTH_KEY } from "@rojer/mf-common";
import type { App } from "../../api/src/index";
import { treaty } from "@elysiajs/eden";
import { Toast } from "@douyinfe/semi-ui";

export const api = treaty<App>("http://localhost:3000", {
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

export const apiProxy = (fun: any) => {
  return async (...args: any) => {
    const { data, error } = await fun(...args);
    if (error) {
      throw error.value;
    }
    return data;
  };
};
