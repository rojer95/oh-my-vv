import { IconUpload } from "@douyinfe/semi-icons";
import { Button, Upload as SemiUpload, Spin } from "@douyinfe/semi-ui";

import { useUploadFun } from "@/hook/upload.hook";
import { customRequestBase64 } from "@/util";
import {
  FileItem,
  UploadProps as SemiUploadProps,
  customRequestArgs,
} from "@douyinfe/semi-ui/lib/es/upload";
import { useEffect, useMemo, useState } from "react";
import { v4 } from "uuid";
import { isPlainObject, pick } from "lodash-es";

const keepFields = ["uid", "url", "name", "size", "uploadType"];

const DefaultChildren = (
  <Button icon={<IconUpload />} theme="light">
    点击上传
  </Button>
);

const urlGetter = (i: any) => {
  if (
    i?.response &&
    typeof i?.response?.url === "string" &&
    i?.response?.url?.indexOf("://") >= 0
  ) {
    return i.response.url;
  }
  return i.url;
};

const uploadTypeGetter = (i: any) => {
  if (i.uploadType) return i.uploadType;

  if (i?.response && typeof i?.response?.uploadType === "string") {
    return i.response.uploadType;
  }
  return null;
};

const value2list = (value: any): FileItem[] => {
  if (Array.isArray(value)) {
    return value.map((i) => ({
      uid: i?.uid || v4(),
      url: i?.url,
      uploadType: i?.uploadType,
      name: i?.name,
      size: i?.size,
      status: "success",
    }));
  }

  if (isPlainObject(value) && value) {
    return [
      {
        uid: value?.uid || v4(),
        url: value?.url,
        uploadType: value?.uploadType,
        name: value?.name,
        size: value?.size,
        status: "success",
      },
    ];
  }

  return [];
};

const list2value = (list: any, multiple: boolean) => {
  const successList = list.filter((i: any) => i.status === "success");
  if (multiple) {
    return successList.map((i: any) =>
      pick(
        {
          ...i,
          url: urlGetter(i),
          uploadType: uploadTypeGetter(i),
        },
        keepFields,
      ),
    );
  }

  if (successList.length === 0) return undefined;
  return pick(
    {
      ...successList[0],
      url: urlGetter(successList[0]),
      uploadType: uploadTypeGetter(successList[0]),
    },
    keepFields,
  );
};

export type UploadProps = Omit<SemiUploadProps, "action"> & {
  value?: any;
  onChange?: (v: any) => void;
  multiple?: boolean;
  multipleSelect?: boolean;
  base64?: boolean;
  action?: string;
};

export const Upload = ({
  action = "",
  value,
  onChange,
  children,
  limit,
  multiple = true,
  multipleSelect = false,
  base64 = false,
  ...props
}: UploadProps) => {
  const { uploadFun } = useUploadFun();
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState<FileItem[]>(value2list(value));

  const customRequest = (o: customRequestArgs) => {
    if (!uploadFun) {
      const e: any = new Error("没有配置上传函数");
      o.onError({}, e);
      return;
    }

    uploadFun(o.fileInstance, o.onProgress)
      .then(o.onSuccess)
      .catch((e) => o.onError({ status: e?.response?.status }, e));
  };

  const notifyOnChange = (fileList: any) => {
    const changeList = fileList.map((i: any) => {
      if (i.status === "success") {
        return {
          ...i,
          url: urlGetter(i),
        };
      }
      return i;
    });
    setList(changeList);

    if (
      changeList.some((i: any) =>
        ["validating", "uploading", "wait"].includes(i.status),
      )
    ) {
      return;
    }

    onChange?.(list2value(changeList, multiple));
  };

  useEffect(() => {
    if (!value) {
      setList([]);
    }
  }, [value]);

  const semiUploadList = useMemo<FileItem[]>(() => {
    return list.map((i, index) => ({
      ...i,
      name:
        i.name || i.url?.slice(i.url.lastIndexOf("/") + 1) || `file${index}`,
      preview:
        i.url
          ?.toLocaleLowerCase()
          .match(/(\.jpg|\.png|\.jpeg|\.bmp|\.gif|\.mp4|\.mp3|\.wav)/) !== null,
    }));
  }, [list]);

  return (
    <Spin spinning={props?.showUploadList ? false : uploading}>
      <SemiUpload
        {...props}
        action={action}
        fileList={semiUploadList}
        onChange={({ fileList }) => notifyOnChange(fileList)}
        customRequest={base64 ? customRequestBase64 : customRequest}
        onSuccess={(...args) => {
          setUploading(false);
          props?.onSuccess?.(...args);
        }}
        onError={(...args) => {
          setUploading(false);
          props?.onError?.(...args);
        }}
        beforeUpload={(arg) => {
          setUploading(true);
          return props?.beforeUpload?.(arg) ?? true;
        }}
        limit={multiple ? limit : 1}
        multiple={multiple ? multipleSelect : false}
        renderThumbnail={(props) => (
          <img src={props.url} style={{ objectFit: "contain" }} />
        )}
      >
        {children ?? DefaultChildren}
      </SemiUpload>
    </Spin>
  );
};
