import React, { useContext } from "react";

export const UploadContext = React.createContext<{
  uploadFun?: (
    file: File,
    onProgress?: (e?: { total: number; loaded: number }) => any
  ) => Promise<{ url: string; fileName: string; uploadType: string }>;
}>({});

export const UploadProvider = UploadContext.Provider;

export const useUploadFun = () => {
  return useContext(UploadContext);
};
