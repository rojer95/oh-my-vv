import { Attachment, FileContent } from "@/component/attachment";
import EasyCrop from "@/component/schema/default/img/crop/easy-crop";
import { IconDelete, IconEyeOpened, IconPlus } from "@douyinfe/semi-icons";
import { Button, Modal, Space, Toast, withField } from "@douyinfe/semi-ui";
import classNames from "classnames";
import { CSSProperties, useMemo, useRef, useState } from "react";
import { UploadBox } from "./style";

interface FileListProps {
  visible: boolean;
  count: number;
  onChange: (value: string[]) => void;
  onClose: () => void;
  mime?: "img" | "video" | "audio";
  crop?: number;
}

export const FileListPicker = ({
  visible,
  count,
  onChange,
  mime = "img",
  onClose,
  crop,
}: FileListProps) => {
  const cropHandle = useRef<any>();
  const [currentCropImage, setCurrentCropImage] = useState<string>();
  const cropInstance = useRef<any>(null);
  const [activeKey, setActiveKey] = useState<any[]>([]);

  const onOk = () => {
    if (activeKey.length === 0) return;
    if (activeKey.length > count) {
      Toast.warning(`最多选择${count}个`);
      return;
    }

    onChange(activeKey.map((i) => i.url));
    onClose();
  };

  // 开始裁切
  const startCrop = (file: File) => {
    return new Promise<File>((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        if (typeof reader.result === "string") {
          setCurrentCropImage(reader.result);
          cropHandle.current = {
            resolve,
            file,
          };
        }
      });
      reader.readAsDataURL(file);
    });
  };

  // 跳过裁切
  const onJumpCrop = () => {
    if (cropHandle.current) {
      cropHandle.current.resolve(cropHandle.current.file);
      cropHandle.current = undefined;
      setCurrentCropImage(undefined);
    }
  };

  // 裁切
  const onCrop = () => {
    if (!cropHandle.current) {
      Toast.warning("裁切的图片丢失");
      return;
    }

    const { name } = cropHandle.current.file;

    const onBlob = async (blob: Blob) => {
      const newFileInstance = new File(
        [blob],
        `${name.slice(0, name.lastIndexOf("."))}.png`,
        {
          type: "image/png",
        }
      );
      cropHandle.current.resolve(newFileInstance);
      cropHandle.current = undefined;
      setCurrentCropImage(undefined);
    };

    cropInstance.current?.getCroppedCanvas().toBlob(onBlob, "image/png");
  };

  return (
    <>
      {currentCropImage ? (
        <Modal
          visible={true}
          title="裁切图片"
          onCancel={onJumpCrop}
          maskClosable={false}
          footer={
            <Space
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={onJumpCrop}>不裁切</Button>
              <Button theme="solid" onClick={onCrop} type="primary">
                确认裁切
              </Button>
            </Space>
          }
        >
          <EasyCrop
            ref={cropInstance}
            image={currentCropImage}
            aspectRatio={crop}
          />
        </Modal>
      ) : null}
      <Modal
        title="素材中心"
        visible={visible}
        width={750}
        onCancel={onClose}
        okText={`已选(${activeKey.length}/${count})`}
        onOk={onOk}
        okButtonProps={{
          disabled: activeKey.length > count,
        }}
      >
        {visible ? (
          <Attachment
            count={count}
            mime={mime}
            beforeUpload={typeof crop === "number" ? startCrop : undefined}
            onChange={setActiveKey}
          />
        ) : null}
      </Modal>
    </>
  );
};

export interface AttachmentPickerProps {
  mime?: "img" | "video" | "audio";
  max?: number;
  value?: string[] | string;
  onChange?: (value?: string[] | string) => void;
  dataType?: "string" | "array";
  placeholder?: string;
  crop?: number;
  size?: "small";
  style?: CSSProperties;
}

/**
 * 图片上传组件
 */
export const AttachmentPicker = ({
  value,
  onChange,
  max = 9,
  mime = "img",
  dataType = "array",
  placeholder = "",
  crop = undefined,
  size,
  style = {},
}: AttachmentPickerProps) => {
  const [preview, setPreview] = useState<any>({
    show: false,
    url: "",
  });

  const realMax = useMemo(() => {
    if (dataType === "string") return 1;
    return max;
  }, [max, dataType]);

  const [fileListVisible, setFileListVisible] = useState(false);

  const files = useMemo<string[]>(() => {
    if (!value) return [];
    if (typeof value === "string") {
      return [value];
    }
    return value;
  }, [dataType, value]);

  const handlePreview = (url: string) => {
    setPreview({
      show: true,
      url: url,
    });
  };

  const handleCancel = () => {
    setPreview({
      show: false,
      url: "",
    });
  };

  const remove = (index: number) => {
    const removed: string[] = [
      ...files.slice(0, index),
      ...files.slice(index + 1),
    ].filter((i) => !!i);
    if (dataType === "string") {
      onChange?.(removed?.[0]);
    } else {
      onChange?.(removed);
    }
  };

  const plus = (plusValue: string[]) => {
    const newvalue = [...files, ...plusValue];
    if (dataType === "string") {
      onChange?.(newvalue?.[0]);
    } else {
      onChange?.(newvalue);
    }
  };

  return (
    <>
      <Modal
        visible={preview.show}
        title="预览文件"
        footer={null}
        onCancel={handleCancel}
        keepDOM={false}
        bodyStyle={{ paddingBottom: 24 }}
      >
        <FileContent url={preview.url} controls={true} className="preview" />
      </Modal>

      <FileListPicker
        visible={fileListVisible}
        count={realMax - files.length}
        mime={mime}
        onChange={plus}
        onClose={() => {
          setFileListVisible(false);
        }}
        crop={crop}
      />

      <UploadBox style={style} className="picture">
        {files.map((url: string, index: number) => {
          return (
            <div
              className={classNames("file-item", { [size || ""]: true })}
              key={`${url}_${index}`}
            >
              <div className="content">
                <FileContent
                  url={url}
                  className={classNames({ [size || ""]: true })}
                />
                <div className="actions">
                  <IconEyeOpened
                    className="action"
                    onClick={() => {
                      handlePreview(url);
                    }}
                  />
                  <IconDelete
                    className="action"
                    onClick={() => {
                      remove(index);
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {files.length < realMax && (
          <div
            className={classNames("semi-upload-add semi-upload-picture-add", {
              [size || ""]: true,
            })}
            style={{ flexDirection: "column" }}
            onClick={() => {
              setFileListVisible(true);
            }}
          >
            <IconPlus size="large" />
            {placeholder ? (
              <div style={{ fontSize: 12, marginTop: 4 }}>{placeholder}</div>
            ) : null}
          </div>
        )}
      </UploadBox>
    </>
  );
};

export const AttachmentPickerField = withField(AttachmentPicker);
