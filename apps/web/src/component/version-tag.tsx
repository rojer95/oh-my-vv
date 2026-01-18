import { Modal, Tag } from "@douyinfe/semi-ui";
import axios from "axios";
import { useEffect } from "react";

export const VersionTag = () => {
  const reload = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.location.reload(true);
  };

  useEffect(() => {
    axios
      .get(
        `${
          import.meta.env.VITE_BASE_URL || "/"
        }version.json?t=${new Date().valueOf()}`
      )
      .then(({ data }: any) => {
        if (data?.[import.meta.env.MODE] !== import.meta.env.VITE_VERSION) {
          Modal.info({
            title: "新版本提示",
            content: (
              <>
                <div>
                  发现新版本 v{data?.[import.meta.env.MODE]}，请您刷新版本 ~
                </div>
              </>
            ),
            hasCancel: false,
            okText: "刷新版本",
            onOk: () => {
              reload();
            },
            maskClosable: false,
            closeOnEsc: false,
            closable: false,
          });
        }
      })
      .catch(console.log);
  }, []);

  return (
    <div className="global-version">
      <Tag
        onClick={reload}
        color={import.meta.env.MODE === "production" ? "green" : "red"}
      >
        {import.meta.env.MODE === "production" ? "正式环境" : "测试环境"} v
        {import.meta.env.VITE_VERSION}
      </Tag>
    </div>
  );
};
