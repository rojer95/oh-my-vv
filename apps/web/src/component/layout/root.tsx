import { adminModel } from "@/mobx/admin";
import { ConfigProvider as SemiConfigProvider, Spin } from "@douyinfe/semi-ui";
import zh_CN from "@douyinfe/semi-ui/lib/es/locale/source/zh_CN";
import {
  ConfigProvider as DSlateConfigProvider,
  defaultConfig,
} from "@dslate/semi";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { SchemaProvider } from "@/component/schema/context/global-schema-provider";
import { UploadProvider } from "@/hook/upload.hook";
import { customRequest } from "@/util";
import { observer } from "mobx-react-lite";
import { Helmet, HelmetProvider } from "react-helmet-async";

export const RootElement = observer(() => {
  useEffect(() => {
    adminModel.autoLogin();
  }, []);

  return (
    <Spin spinning={adminModel.autoLogining}>
      <HelmetProvider>
        <SchemaProvider>
          <UploadProvider
            value={{
              uploadFun: async (file, onProgress) => {
                return new Promise((resolve, reject) => {
                  customRequest(
                    {
                      fileInstance: file,
                      onProgress: onProgress,
                      onError: (_, e) => reject(e),
                      onSuccess: resolve,
                    },
                    false,
                  );
                });
              },
            }}
          >
            <SemiConfigProvider locale={zh_CN}>
              <DSlateConfigProvider
                value={{
                  ...defaultConfig,
                  customUploadRequest: async ({
                    onProgress,
                    onError,
                    onSuccess,
                    file,
                  }: any) => {
                    customRequest({
                      onProgress: (p: any) => {
                        onProgress?.({ percent: (p.loaded / p.total) * 100 });
                      },
                      file,
                      fileInstance: file,
                      onError: (_, e) => {
                        onError(e);
                      },
                      onSuccess,
                    });
                  },
                }}
              >
                <Helmet>
                  <title>平台后台 - {import.meta.env.VITE_TITLE}</title>
                </Helmet>
                <Outlet />
              </DSlateConfigProvider>
            </SemiConfigProvider>
          </UploadProvider>
        </SchemaProvider>
      </HelmetProvider>
    </Spin>
  );
});
