import { api } from "@/api";
import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { Tag, Toast } from "@douyinfe/semi-ui";
import { PERMISSIONS } from "@rojer/mf-common";
import { useRef, useState } from "react";

export const DictDetailPage = ({ systemDictId }: { systemDictId: number }) => {
  const tableRef = useRef<SchemaTableInstance>(undefined);
  const [editVisible, setEditVisible] = useState(false);
  const [initValues, setInitValues] = useState<any>({});

  const onSubmit = async (value: any) => {
    if (initValues?.id) {
      await api.api.v1["system-dict-detail"]({ id: initValues.id }).put({
        ...value,
        systemDictId,
      });
      Toast.success("修改成功");
    } else {
      await api.api.v1["system-dict-detail"].post({
        ...value,
        systemDictId,
      });
      Toast.success("创建成功");
    }

    tableRef.current?.refresh?.();
  };

  if (!systemDictId) return null;

  return (
    <>
      <SchemaForm
        layout="modal"
        modalProps={{
          visible: editVisible,
          onCancel: () => {
            setInitValues({});
            setEditVisible(false);
          },
          title: `${initValues?.id ? "编辑" : "创建"}`,
        }}
        initValues={initValues}
        onSubmit={onSubmit}
        columns={[
          {
            dataIndex: "name",
            title: "键名",
            required: true,
            props: {
              rules: [{ max: 128 }],
            },
          },

          {
            dataIndex: "key",
            title: "键值",
            required: true,
            props: {
              extraText: "键值设定后不可修改",
              readonly: !!initValues?.id,
              disabled: !!initValues?.id,
              rules: [
                {
                  type: "string",
                  pattern: /^[a-zA-Z][a-zA-Z\d]+$/,
                  message: "仅支持 字母数字 组成 且需要以字母开头",
                },
                { max: 128 },
              ],
            },
          },

          {
            dataIndex: "active",
            title: "启用",
            type: "switch",
          },

          {
            dataIndex: "sort",
            title: "排序",
            type: "number",
            props: { precision: 0, min: 0 },
          },

          {
            dataIndex: "color",
            title: "标签样式",
            type: "select",
            props: {
              options: [
                { label: "默认样式", value: null },
                { label: <Tag color="blue">主要色</Tag>, value: "blue" },
                {
                  label: <Tag color="light-blue">次要色</Tag>,
                  value: "light-blue",
                },
                {
                  label: <Tag color="grey">最次要色</Tag>,
                  value: "grey",
                },
                {
                  label: <Tag color="green">成功色</Tag>,
                  value: "green",
                },
                {
                  label: <Tag color="yellow">警告色</Tag>,
                  value: "yellow",
                },
                {
                  label: <Tag color="red">错误色</Tag>,
                  value: "red",
                },
              ],
              rules: [{ max: 512 }],
            },
          },

          {
            dataIndex: "style",
            title: "样式代码",
            type: "textarea",
            props: {
              rules: [{ max: 512 }],
            },
          },

          {
            dataIndex: "note",
            title: "备注",
            type: "textarea",
            props: {
              rules: [{ max: 512 }],
            },
          },
        ]}
      />
      <SchemaTable
        tableRef={tableRef}
        request={(args) =>
          api.api.v1["system-dict-detail"].read.post({
            ...args,
            where: [
              ...(args?.where || []),
              { key: "systemDictId", value: systemDictId },
            ],
          })
        }
        updateAccess={PERMISSIONS.systemDictUpdate.key}
        createAccess={PERMISSIONS.systemDictCreate.key}
        deleteAccess={PERMISSIONS.systemDictDelete.key}
        onUpdate={(record) => {
          setInitValues(record);
          setEditVisible(true);
        }}
        onCreate={() => {
          setInitValues({});
          setEditVisible(true);
        }}
        onDelete={async (record) => {
          await api.api.v1["system-dict-detail"]({ id: record.id }).delete();
          tableRef.current?.refresh?.();
        }}
        columns={[
          { dataIndex: "id", title: "ID" },

          {
            dataIndex: "name",
            title: "键名",
            tableColumnRender: (_, __, record) => {
              if (record.color) return <Tag color={record.color}>{_}</Tag>;
              return _;
            },
          },

          {
            dataIndex: "key",
            title: "键值",
          },

          {
            dataIndex: "active",
            title: "状态",
            type: "fast-radio",
            width: 60,
            props: {
              permission: "system:department:update",
              onSubmit: async (editValue, record) => {
                await api.api.v1["system-dict-detail"]({ id: record.id })[
                  "fastUpdate"
                ].put({ active: editValue });
                tableRef.current?.refresh?.();
              },
            },
          },
          {
            dataIndex: "sort",
            title: "排序",
            sorter: true,
            type: "fast-index",
            width: 60,
            props: {
              permission: "system:department:update",
              onSubmit: async (editValue, record) => {
                await api.api.v1["system-dict-detail"]({ id: record.id })[
                  "fastUpdate"
                ].put({ sort: editValue });
                tableRef.current?.refresh?.();
              },
            },
          },

          {
            dataIndex: "createdAt",
            title: "创建时间",
            type: "datetime",
            sorter: true,
            width: 200,
          },
          {
            type: "action",
            width: 100,
          },
        ]}
      />
    </>
  );
};
