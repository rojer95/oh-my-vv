import { api } from "@/api";
import { SchemaForm } from "@/component/schema/form";
import { SpinBox } from "@/component/spin-box";
import { Card, Toast } from "@douyinfe/semi-ui";
import { useRequest } from "ahooks";

export const UploadConfigPage = () => {
  const { data, loading, refresh } = useRequest(api.api.v1.upload.setting.get);

  return (
    <Card>
      {loading ? (
        <SpinBox />
      ) : (
        <SchemaForm
          initValues={data}
          onSubmit={async (value) => {
            await api.api.v1.upload.setting.put(value);
            Toast.success("修改成功");
            refresh();
          }}
          columns={[
            {
              type: "section",
              title: "文件上传配置",
              columns: [
                {
                  title: "文件大小上限",
                  dataIndex: "fileMaxSize",
                  type: "number",
                  required: true,
                  width: 400,
                  min: 1,
                  props: {
                    permission: 0,
                    suffix: "M",
                  },
                },

                {
                  title: "允许上传文件后缀",
                  dataIndex: "allowExts",
                  type: "textarea",
                  width: 400,
                  props: {
                    extraText:
                      "用英文逗号,隔开。例如：" +
                      [
                        ".gif",
                        ".jpeg",
                        ".jpg",
                        ".png",
                        ".svg",
                        ".ogg",
                        ".webm",
                        ".mp4",
                        ".ogg",
                        ".mp3",
                        ".wav",
                      ].join(","),
                  },
                },

                {
                  title: "存储类型",
                  dataIndex: "type",
                  type: "radio",
                  required: true,
                  props: {
                    options: [
                      { label: "本地", value: "local" },
                      { label: "七牛云", value: "qiniu" },
                      { label: "阿里OSS", value: "oss" },
                      { label: "腾讯COS", value: "cos" },
                    ],
                  },
                },
              ],
            },

            {
              deps: ["type"],
              type: ({ values }) =>
                values?.type === "local" ? "section" : "hidden",
              title: "本地上传配置",
              width: 400,
              columns: [
                {
                  dataIndex: "local.domain",
                  title: "空间域名",
                  required: true,
                  props: {
                    extraText: "不需以/结尾",
                  },
                },
                {
                  dataIndex: "local.prefix",
                  title: "前缀",
                  props: {
                    extraText: "需以/结尾，例如 img/",
                  },
                },
              ],
            },

            {
              deps: ["type"],
              type: ({ values }) =>
                values?.type === "qiniu" ? "section" : "hidden",
              title: "七牛云配置",
              width: 400,
              columns: [
                {
                  dataIndex: "qiniu.ak",
                  title: "Ak",
                  required: true,
                },
                {
                  dataIndex: "qiniu.sk",
                  title: "Sk",
                  required: true,
                },
                {
                  dataIndex: "qiniu.bucket",
                  title: "Bucket",
                  required: true,
                },
                {
                  dataIndex: "qiniu.domain",
                  title: "空间域名",
                  required: true,
                  props: {
                    extraText: "不需以/结尾",
                  },
                },
                {
                  dataIndex: "qiniu.zone",
                  title: "区域",
                  type: "select",
                  required: true,
                  props: {
                    options: [
                      { label: "华东", value: "z0" },
                      { label: "华北", value: "z1" },
                      { label: "华南", value: "z2" },
                      { label: "北美", value: "na0" },
                      { label: "东南亚", value: "as0" },
                    ],
                  },
                },
                {
                  dataIndex: "qiniu.prefix",
                  title: "前缀",
                  props: {
                    extraText: "需以/结尾，例如 img/",
                  },
                },
              ],
            },

            {
              deps: ["type"],
              type: ({ values }) =>
                values?.type === "oss" ? "section" : "hidden",
              title: "阿里OSS配置",
              width: 400,
              columns: [
                {
                  dataIndex: "oss.accessKeyId",
                  title: "AccessKeyId",
                  required: true,
                },
                {
                  dataIndex: "oss.accessKeySecret",
                  title: "AccessKeySecret",
                  required: true,
                },
                {
                  dataIndex: "oss.bucket",
                  title: "Bucket",
                  required: true,
                  props: {
                    extraText: "需要在阿里云配置允许跨域上传",
                  },
                },
                {
                  dataIndex: "oss.domain",
                  title: "空间域名",
                  required: true,
                  props: {
                    extraText: "不需以/结尾",
                  },
                },
                {
                  dataIndex: "oss.prefix",
                  title: "前缀",
                  props: {
                    extraText: "需以/结尾，例如 img/",
                  },
                },
              ],
            },

            {
              deps: ["type"],
              type: ({ values }) =>
                values?.type === "cos" ? "section" : "hidden",
              title: "腾讯COS配置",
              width: 400,
              columns: [
                {
                  dataIndex: "cos.secretId",
                  title: "SecretId",
                  required: true,
                },
                {
                  dataIndex: "cos.secretKey",
                  title: "SecretKey",
                  required: true,
                },
                {
                  dataIndex: "cos.region",
                  title: "Region",
                  required: true,
                },
                {
                  dataIndex: "cos.bucket",
                  title: "Bucket",
                  required: true,
                  props: {
                    extraText: "需要在阿里云配置允许跨域上传",
                  },
                },
                {
                  dataIndex: "cos.domain",
                  title: "空间域名",
                  required: true,
                  props: {
                    extraText: "不需以/结尾",
                  },
                },
                {
                  dataIndex: "cos.prefix",
                  title: "前缀",
                  props: {
                    extraText: "需以/结尾，例如 img/",
                  },
                },
              ],
            },

            {
              type: "section",
              title: "测试上传",
              columns: [
                {
                  dataIndex: "tests",
                  type: "file",
                  title: "多文件",
                  props: {},
                },
                {
                  dataIndex: "test",
                  type: "file",
                  title: "单文件",
                  props: {
                    multiple: false,
                  },
                },
              ],
            },
          ]}
        />
      )}
    </Card>
  );
};
