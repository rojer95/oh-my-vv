import { BusinessError } from "@/exception/business.error";
import { Toast } from "@douyinfe/semi-ui";
import axios, { AxiosRequestConfig } from "axios";

const handleErr = (e: Error, toast = true) => {
  const message =
    { "Network Error": "网络异常，请检查网络" }[e.message] || e.message;
  if (toast) Toast.error({ content: message, stack: true, duration: 2 });
  throw e;
};

export const generateBaseApi = (
  baseURL: string,
  authStorageKey?: string,
  authHeaderKey?: string
) => {
  return (module: string, version = "v1", timeout = 30000) => {
    const instance = axios.create({
      baseURL: `${baseURL || ""}/${version}/${module}`,
      timeout,
      validateStatus: () => true,
    });

    instance.interceptors.request.use(function (config) {
      const token = authStorageKey
        ? (localStorage[authStorageKey] ?? sessionStorage[authStorageKey])
        : undefined;
      if (token && authHeaderKey) config.headers[authHeaderKey] = token;
      return config;
    });

    instance.interceptors.response.use(function (response) {
      const { data } = response;

      if (data?.code !== 0) {
        if (data?.code === 401) {
          window.config.logout();
        }

        handleErr(
          new BusinessError(data?.message, data.code),
          response.config.headers?.toast ?? true
        );
      }

      return data.data;
    }, handleErr);

    return <T = any>(cfg: AxiosRequestConfig) => instance.request<any, T>(cfg);
  };
};
