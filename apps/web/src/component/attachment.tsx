import { TakePicture } from "@/component/take-picture";
import { useUploadFun } from "@/hook/upload.hook";
import { getFileExt, md5File } from "@/util";
import {
  IconDelete,
  IconMaximize,
  IconSetting,
  IconUpload,
} from "@douyinfe/semi-icons";
import {
  Button,
  Dropdown,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Progress,
  Upload as SemiUpload,
  Space,
  Toast,
  Tree,
} from "@douyinfe/semi-ui";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const FileListBox = styled.div<any>`
  display: flex;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  width: 100%;

  > .semi-space {
    width: 100%;
  }

  .left-box {
    flex-shrink: 0;
    width: 150px;
    max-height: 300px;
    overflow-y: auto;
  }

  .right-box {
    flex-grow: 1;
    height: 100%;
    .file-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;

      .item {
        height: 118px;
        width: 96px;
        overflow: hidden;
        vertical-align: top;
        border: 1px solid var(--semi-color-border);
        border-radius: 2px;
        transition: all 0.3s;

        .i-content {
          height: 118px;
          width: 96px;
        }

        &.active,
        &:hover {
          border-color: var(--semi-color-primary);
        }

        &.active {
          position: relative;

          &::after {
            position: absolute;
            right: 0px;
            bottom: 0px;
            width: 24px;
            height: 24px;
            line-height: 24px;
            color: #ffffff;
            text-align: center;
            background-color: var(--semi-color-primary);
            border-radius: 5px 0px 0px 0px;
            content: "✓";
            transform: scale(0.7);
            transform-origin: right bottom;
          }
        }
      }
    }
  }
`;

const ContentStyle = styled.div<any>`
  height: 96px;
  width: 96px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;

  &.small {
    width: 30px;
    height: 30px;

    .ext {
      display: none;
    }
  }

  &.preview {
    width: 100%;
    height: auto;
    img,
    video,
    audio {
      width: 100%;
      height: auto;
    }
  }

  .ext {
    position: absolute;
    top: 0px;
    right: 0px;
    min-width: 30px;
    height: 22px;
    padding: 0px 2px;
    color: #ffffff;
    font-size: 10px;
    line-height: 22px;
    text-align: center;
    background-color: #bbbbbb;
    border-radius: 0px 0px 0px 5px;
    transform: scale(0.7);
    transform-origin: right top;
  }

  .name {
    height: 22px;
    line-height: 22px;
    font-size: 12px;
    overflow: hidden;
  }

  img,
  video,
  audio {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: var(--semi-color-fill-0);
    border-radius: 3px;
  }

  div {
    overflow: hidden;
    color: gray;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

const MIME_EXT: Record<string, string> = {
  img: ".gif,.jpeg,.jpg,.png,.svg,.ico",
  audio: ".mp3,.wav",
  video: ".mp4,.webm",
};

const getExtType: (
  url: string,
) => ["img" | "video" | "audio" | undefined, string] = (url: string) => {
  const ext = `.${getFileExt({ name: url } as any)}`;
  if (
    [".gif", ".jpeg", ".jpg", ".png", ".svg", ".ico"].includes(
      ext.toLowerCase(),
    )
  ) {
    return ["img", ext];
  }

  if ([".mp4", ".webm"].includes(ext.toLowerCase())) {
    return ["video", ext];
  }

  if ([".mp3", ".wav"].includes(ext.toLowerCase())) {
    return ["audio", ext];
  }

  return [undefined, ext];
};

const TypeName: Record<string, string> = {
  img: "图片",
  video: "视频",
  audio: "音频",
};

export const FileContent = ({
  url,
  controls = false,
  style = {},
  name,
  className,
}: {
  url: string;
  name?: string;
  className?: string;
  controls?: boolean;
  style?: any;
}) => {
  const [type, ext]: [any, string] = getExtType(url);

  return (
    <ContentStyle className={className} style={style}>
      <div className="ext">{TypeName[type]}</div>
      {type === "img" && <img src={url} />}
      {type === "video" && (
        <video src={url} style={style} controls={controls} />
      )}
      {type === "audio" && (
        <audio src={url} style={style} controls={controls} />
      )}
      {!type && <div>{ext}</div>}
      {name ? <div className="name">{name}</div> : null}
    </ContentStyle>
  );
};

const data2tree = (data: any[]): any => {
  if (!data) return undefined;
  return data.map((i: any) => {
    return {
      label: i.name,
      value: i.id,
      key: `${i.id}`,
      children: data2tree(i.children),
    };
  });
};

interface AttachmentProps {
  count?: number;
  onChange?: (value: string[]) => void;
  mime?: "img" | "video" | "audio";
  beforeUpload?: (file: File) => Promise<File>;
  pageSize?: number;
}

export const Attachment = ({
  count,
  beforeUpload,
  onChange,
  mime,
  pageSize = 10,
}: AttachmentProps) => {
  const { uploadFun } = useUploadFun();
  const queue = useRef<File[]>([]);
  const uploading = useRef(false);
  const [accept, setAccpet] = useState<string | undefined>(undefined);
  const [percent, setPercent] = useState<number>(0);
  const [rid, setRid] = useState(0);
  const [pagination, setPagination] = useState<{
    current: number;
    pageSize: number;
    total: number;
  }>({
    current: 1,
    pageSize: pageSize,
    total: 0,
  });
  const [categoryEditMode, setCategoryEditMode] = useState<"create" | "update">(
    "create",
  );
  const [categoryInput, setCategoryInput] = useState<string>("");
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(undefined);
  const [activeKey, setActiveKey] = useState<any[]>([]);

  const [categoryEditable, setCategoryEditable] = useState<boolean>(false);

  useEffect(() => {
    onChange?.(activeKey);
  }, [activeKey]);

  const init = async (isReload = true) => {
    setPercent(0);
    setAccpet(MIME_EXT[mime || ""]);
    const data = await api?.v1.attachmentCategory.read();
    const treeData = data2tree([data]);
    setCategoryTree(treeData);
    if (isReload) {
      setActiveKey([]);
      setCurrentCategory(treeData[0]);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const load = async () => {
    const [data, total] = await api?.v1.attachment.read({
      page: pagination.current,
      pageSize: pagination.pageSize,
      where: [
        { key: "categoryId", value: currentCategory?.value },
        { key: "mime", value: mime },
      ],
      order: { createdAt: "desc" },
    });

    setPagination({
      ...pagination,
      total,
    });

    setDataSource(data);
  };

  useEffect(() => {
    if (pagination.current === 1) {
      load();
    } else {
      setPagination({
        ...pagination,
        current: 1,
      });
    }
  }, [accept, rid, currentCategory]);

  useEffect(() => {
    load();
  }, [pagination.current, pagination.pageSize]);

  const push = (item: any) => {
    if (count === 1) {
      setActiveKey([{ ...item }]);
    } else {
      const is = activeKey.some((i) => i.id === item.id);
      if (is) {
        setActiveKey([...activeKey.filter((i) => i.id !== item.id)]);
      } else {
        setActiveKey([...activeKey, { ...item }]);
      }
    }
  };

  const onStartUpload = async () => {
    if (uploading.current) return;
    uploading.current = true;

    let file = queue.current.pop();

    if (!file) {
      uploading.current = false;
      return;
    }

    if (beforeUpload) {
      file = await beforeUpload(file);
    }

    setPercent(0);

    try {
      setPercent(1);

      const fileMd5 = await md5File(file);

      let attachment = await api?.v1.attachment.exist(fileMd5 as string);

      if (!attachment) {
        attachment = await uploadFun?.(file, (p) => {
          p && setPercent((p.loaded / p.total) * 100);
        });
      }

      let fileMime = mime;
      if (!fileMime) {
        const [type] = getExtType(attachment.url);
        fileMime = type;
      }
      const result = await api?.v1.attachment.create({
        categoryId: currentCategory?.value,
        fileName: attachment.fileName,
        fileMd5: fileMd5,
        uploadType: attachment.uploadType,
        url: attachment.url,
        mime: fileMime,
        fileSize: file.size,
      });

      if (onChange && typeof count === "number") {
        setActiveKey((p) => {
          if (p.length < count) {
            return [...p, { ...result }];
          }
          return p;
        });
      }

      setRid((r) => r + 1);
    } catch (error: any) {
      Toast.error(error.message);
    } finally {
      // next loop
      setPercent(0);
      uploading.current = false;
      setTimeout(() => {
        onStartUpload();
      }, 0);
    }
  };

  return (
    <>
      <Space>
        <SemiUpload
          action=""
          accept={accept}
          showUploadList={false}
          beforeUpload={({ file }) => {
            // console.log("file", file);
            if (!file.fileInstance) return false;
            queue.current.push(file.fileInstance);
            // console.log("queue.current", queue.current.length);
            onStartUpload();
            return false;
          }}
          multiple
        >
          <Button type="primary" icon={<IconUpload />}>
            本地上传
          </Button>
        </SemiUpload>

        <TakePicture
          onChange={(file: File) => {
            if (!file) return false;
            queue.current.push(file);
            onStartUpload();
            return false;
          }}
        />

        {categoryEditable ? (
          <Input
            placeholder="请输入分组名称"
            value={categoryInput}
            onInput={(e: any) => setCategoryInput(e.target.value)}
            addonAfter={
              <Button
                onClick={async () => {
                  if (categoryInput) {
                    if (categoryEditMode === "create") {
                      await api?.v1.attachmentCategory.create({
                        name: categoryInput,
                        parentId: currentCategory?.value,
                      });
                      init(false);
                    }

                    if (
                      categoryEditMode === "update" &&
                      currentCategory?.value
                    ) {
                      await api?.v1.attachmentCategory.update(
                        currentCategory.value,
                        {
                          name: categoryInput,
                        },
                      );
                      init(false);
                    }

                    setCategoryEditable(false);
                  }
                }}
              >
                {categoryEditMode === "create" ? "创建" : "修改"}分组
              </Button>
            }
          />
        ) : null}

        <Dropdown
          position="bottom"
          render={
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => {
                  setCategoryEditMode("create");
                  setCategoryInput("");
                  setCategoryEditable(true);
                }}
                key="create"
              >
                新建分组
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setCategoryEditMode("update");
                  setCategoryInput(currentCategory?.label);
                  setCategoryEditable(true);
                }}
                key="update"
              >
                修改分组
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Item
                key="delete"
                style={{ color: "var(--semi-color-danger)" }}
                onClick={() => {
                  Modal.confirm({
                    title: "操作确认",
                    content: "是否要删除这个分组？",
                    onOk: async () => {
                      if (!currentCategory?.value) return;
                      await api?.v1.attachmentCategory.del(
                        currentCategory?.value,
                      );
                      init();
                      setCategoryEditable(false);
                    },
                  });
                }}
              >
                删除分组
              </Dropdown.Item>
            </Dropdown.Menu>
          }
        >
          <Button icon={<IconSetting />}>分组管理</Button>
        </Dropdown>

        {activeKey.length > 0 ? (
          <>
            <Button
              onClick={() => {
                setActiveKey([]);
              }}
              icon={<IconMaximize />}
              type="tertiary"
            >
              取消选择
            </Button>
            <Popconfirm
              title="删除确认"
              content="此操作仅会删除管理器内记录，并不会实际删除文件。是否删除选定记录？"
              onConfirm={async () => {
                for (const activeKeyItem of activeKey) {
                  await api?.v1.attachment.del(activeKeyItem?.id);
                }

                setActiveKey([]);
                load();
              }}
            >
              <Button icon={<IconDelete />} type="danger">
                删除选定
              </Button>
            </Popconfirm>
          </>
        ) : null}
      </Space>
      <div style={{ height: 12, paddingTop: 4, paddingBottom: 4 }}>
        {percent > 0 && (
          <Progress size="small" percent={percent} showInfo={false} />
        )}
      </div>
      <FileListBox>
        <Space align="start">
          <Tree
            className="left-box"
            treeData={categoryTree}
            value={currentCategory}
            onChange={(v) => {
              setCurrentCategory(v);
              setCategoryEditable(false);
            }}
            onChangeWithObject
            expandAll
          />

          <div className="right-box">
            <div className="file-list">
              {dataSource.map((item) => (
                <div
                  key={item.id}
                  className={`item ${
                    activeKey.some((i) => i.id === item.id) ? "active" : ""
                  }`}
                  onClick={() => {
                    push(item);
                  }}
                >
                  <FileContent
                    className="i-content"
                    url={item.url}
                    name={item.fileName}
                  />
                </div>
              ))}

              {dataSource.length === 0 ? (
                <div className="semi-list-empty">暂无文件</div>
              ) : null}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Pagination
                currentPage={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                showSizeChanger={false}
                onChange={(current, pageSize) => {
                  setPagination({
                    ...pagination,
                    current,
                    pageSize,
                  });
                }}
              />
            </div>
          </div>
        </Space>
      </FileListBox>
    </>
  );
};
