import axios from "axios";
import BMF from "browser-md5-file";
import { isPlainObject } from "lodash-es";
import { customRequestArgs } from "@douyinfe/semi-ui/lib/es/upload";
import { api } from "@/api";
import { Toast } from "@douyinfe/semi-ui";

const bmf = new BMF();

export const customRequestBase64 = async ({ onSuccess, fileInstance }: any) => {
  const reader: FileReader = new FileReader();
  reader.addEventListener(
    "load",
    () => {
      onSuccess?.({ url: reader.result as string });
    },
    false,
  );
  reader.readAsDataURL(fileInstance);
};

export const md5File = (file: File) =>
  new Promise((resolve, reject) => {
    bmf.md5(file, (err: any, md5: string) => {
      if (err) reject(err);
      else resolve(md5);
    });
  });

/**
 * 上传文件
 * @param host
 * @param file
 * @param key
 * @param token
 * @param progress
 */
export const uploadFile = async (
  url: string,
  file: File,
  body?: any,
  options?: any,
  progress?: (progress: number) => void,
) => {
  const formData = new FormData();

  Object.entries(body ?? {}).forEach(([key, value]: [string, any]) => {
    formData.append(key, value);
  });

  formData.append("file", file);

  try {
    const res = await axios.post(url, formData, {
      ...options,
      onUploadProgress(progressEvent: any) {
        progress?.(progressEvent.progress * 100);
      },
      timeout: 0,
    });

    if (isPlainObject(res.data) && "code" in res.data && res.data.code !== 0) {
      throw new Error(res?.data?.message);
    }
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw new Error(error?.response?.data?.error);
    }
    throw error;
  }
};

export const customRequest = async (
  {
    onProgress,
    onError,
    onSuccess,
    fileInstance,
    file,
  }: Partial<customRequestArgs>,
  showToast = true,
) => {
  if (!fileInstance) throw new Error(`要上传的文件不存在`);

  try {
    const { host, body, attachment } = await api.api.v1.upload.sign.post({
      filename: fileInstance.name,
      filesize: fileInstance.size,
    });

    if (attachment.fileMaxSize < fileInstance.size) {
      throw new Error(
        `文件大小超出限制，最大上限${attachment.fileMaxSize / 1024 / 1024}M`,
      );
    }

    await uploadFile(host, fileInstance, body, {}, (loaded) =>
      onProgress?.({ total: 100, loaded }),
    );

    onSuccess?.(attachment);
  } catch (error: any) {
    if (showToast) Toast.warning(error.message);
    else console.error(error);
    if (file) file.validateMessage = error.message;
    onError?.({}, error);
  }
};
