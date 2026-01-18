import LocaleConsumer from "@douyinfe/semi-ui/lib/es/locale/localeConsumer";
import SemiModal from "@douyinfe/semi-ui/lib/es/modal";
import { useCallback, useMemo, useRef, useState } from "react";

import EasyCrop from "./easy-crop";
import type { ImgCropProps } from "./typing";

import { Button, Space } from "@douyinfe/semi-ui";
import { FileItem, UploadProps } from "@douyinfe/semi-ui/lib/es/upload";

const ImgCrop = (props: ImgCropProps) => {
  const {
    modalTitle,
    modalWidth,
    modalOk,
    modalCancel,
    onModalOk,
    onModalCancel,

    onUploadFail,
    children,

    cropperProps,
  } = props;

  const reqId = useRef<number>();
  const queue = useRef<any[]>([]);
  const queueing = useRef<boolean>(false);
  const passall = useRef<boolean>(false);
  const [many, setMany] = useState<boolean>(false);

  const handleQueue = async () => {
    if (queue.current.length === 0) {
      reqId.current && cancelAnimationFrame(reqId.current);
      queueing.current = false;
      passall.current = false;
      return;
    } else {
      const { file, resolve, reject } = queue.current.pop();
      fileRef.current = file;
      resolveRef.current = (newFile) => {
        cb.current.onModalOk?.(newFile);
        resolve(newFile);
        reqId.current = requestAnimationFrame(handleQueue);
      };

      rejectRef.current = (uploadErr) => {
        cb.current.onUploadFail?.(uploadErr);
        reject(uploadErr);
        reqId.current = requestAnimationFrame(handleQueue);
      };

      if (passall.current) {
        onCancel();
        return;
      }

      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => typeof reader.result === "string" && setImage(reader.result)
      );
      reader.readAsDataURL(file.fileInstance);
    }
  };

  const startQueue = () => {
    if (queueing.current) return;
    queueing.current = true;
    reqId.current = requestAnimationFrame(handleQueue);
  };

  const cb = useRef<
    Pick<ImgCropProps, "onModalOk" | "onModalCancel" | "onUploadFail">
  >({});
  cb.current.onModalOk = onModalOk;
  cb.current.onModalCancel = onModalCancel;
  cb.current.onUploadFail = onUploadFail;

  /**
   * Upload
   */
  const [image, setImage] = useState("");
  const fileRef = useRef<FileItem>();
  const beforeUploadRef = useRef<UploadProps["beforeUpload"]>();
  const resolveRef = useRef<ImgCropProps["onModalOk"]>();
  const rejectRef = useRef<(err: Error) => void>();

  const uploadComponent: any = useMemo(() => {
    const upload = Array.isArray(children) ? children[0] : children;
    const { beforeUpload, accept, ...restUploadProps } = upload.props;
    beforeUploadRef.current = beforeUpload;

    return {
      ...upload,
      props: {
        ...restUploadProps,
        accept: accept || "image/*",
        beforeUpload: ({ file, fileList }: any) => {
          const uploadings = fileList.filter(
            (i: any) => i.status === "uploading"
          );
          setMany(uploadings.length > 1);
          return new Promise((resolve, reject) => {
            queue.current.push({ file, resolve, reject });
            startQueue();
          });
        },
      },
    };
  }, [children]);

  /**
   * Crop
   */
  const cropInstance = useRef<any>(null);

  /**
   * Modal
   */
  const modalProps = useMemo(() => {
    const obj: any = {
      width: modalWidth,
      okText: modalOk,
      cancelText: modalCancel,
    };
    Object.keys(obj).forEach((key) => {
      if (!obj[key]) delete obj[key];
    });
    return obj;
  }, [modalCancel, modalOk, modalWidth]);

  const onClose = () => {
    setImage("");
  };

  const onCancel = useCallback(() => {
    cb.current.onModalCancel?.();
    resolveRef.current?.(fileRef.current);
    onClose();
  }, []);

  const onOk = useCallback(async () => {
    onClose();

    if (!fileRef.current) return;

    // get the new image
    const { uid, name, size, fileInstance } = fileRef.current;
    const type = fileInstance?.type;
    const onBlob = async (blob: Blob) => {
      const newFileInstance = new File([blob], name, { type });
      const newFile = {
        fileInstance: newFileInstance,
      };

      if (typeof beforeUploadRef.current !== "function") {
        return resolveRef.current?.(newFile);
      }

      const preFileItem = {
        uid,
        name,
        size,
        fileInstance: newFileInstance,
      } as FileItem;

      const res = beforeUploadRef.current({
        file: preFileItem,
        fileList: [preFileItem],
      });

      if (typeof res !== "boolean" && !res) {
        console.error("beforeUpload must return a boolean or Promise");
        return;
      }

      if (res === true) return resolveRef.current?.(newFile);
      if (res === false) return rejectRef.current?.(new Error("not upload"));
      if (res && res instanceof Promise) {
        try {
          const passedFile = await res;
          if (passedFile?.fileInstance) {
            return resolveRef.current?.({
              fileInstance: passedFile?.fileInstance,
              uid,
              name,
              size,
            } as FileItem);
          }
          resolveRef.current?.(newFile);
        } catch (err: any) {
          rejectRef.current?.(err);
        }
      }
    };

    cropInstance.current?.getCroppedCanvas().toBlob(onBlob);
  }, []);

  const getComponent = (titleOfModal: any) => (
    <>
      {uploadComponent}
      {image && (
        <SemiModal
          visible={true}
          title={titleOfModal}
          onOk={onOk}
          onCancel={onCancel}
          maskClosable={false}
          footer={
            <Space
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {many ? (
                <Button
                  onClick={() => {
                    passall.current = true;
                    onCancel();
                  }}
                >
                  全部不裁剪
                </Button>
              ) : null}
              <Button onClick={onCancel}>不裁剪</Button>
              <Button theme="solid" onClick={onOk} type="primary">
                确认裁剪
              </Button>
            </Space>
          }
          {...modalProps}
        >
          <EasyCrop ref={cropInstance} image={image} {...cropperProps} />
        </SemiModal>
      )}
    </>
  );

  if (modalTitle) return getComponent(modalTitle);

  return (
    <LocaleConsumer>
      {(_locale, code) =>
        getComponent(code === "zh-CN" ? "编辑图片" : "Edit image")
      }
    </LocaleConsumer>
  );
};

export default ImgCrop;
