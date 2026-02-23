import { api } from "@/api";
import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { Modal, Tag, Toast, Typography } from "@douyinfe/semi-ui";
import { PERMISSIONS } from "@rojer/mf-common";
import { useRef, useState } from "react";
import { DictDetailPage } from "./dict-detail";

export const DictPage = () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentDict, setCurrentDict] = useState<any>(null);
  const tableRef = useRef<SchemaTableInstance>(undefined);
  const [editVisible, setEditVisible] = useState(false);
  const [initValues, setInitValues] = useState<any>({});

  const onSubmit = async (value: any) => {
    if (initValues?.id) {
      await api.api.v1["system-dict"]({ id: initValues.id }).put(value);
      Toast.success("修改成功");
    }

    if (!initValues?.id) {
      await api.api.v1["system-dict"].post(value);
      Toast.success("创建成功");
    }

    tableRef.current?.refresh?.();
  };

  return (
    <>
      <Modal
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        title={`${currentDict?.name || ""}-数据字典`}
        fullScreen
      >
        <DictDetailPage systemDictId={currentDict?.id} />
      </Modal>
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
                  pattern: /^[a-zA-Z][a-zA-Z\d-_]+$/,
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
        title="数据字典"
        tableRef={tableRef}
        request={api.api.v1["system-dict"].read.post}
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
          await api.api.v1["system-dict"]({ id: record.id }).delete();
          tableRef.current?.refresh?.();
        }}
        columns={[
          { dataIndex: "id", title: "ID" },
          {
            dataIndex: "name",
            title: "键名",
            tableColumnRender: (dom, _, record) => {
              return (
                <Typography.Text
                  link
                  onClick={() => {
                    setCurrentDict(record);
                    setDetailVisible(true);
                  }}
                >
                  {dom}
                </Typography.Text>
              );
            },
          },
          {
            dataIndex: "key",
            title: "键值",
            tableColumnRender: (dom, _, record) => {
              return (
                <Typography.Text
                  link
                  onClick={() => {
                    setCurrentDict(record);
                    setDetailVisible(true);
                  }}
                >
                  {dom}
                </Typography.Text>
              );
            },
          },
          {
            dataIndex: "active",
            title: "状态",
            type: "active",
            width: 100,
            props: {
              permission: PERMISSIONS.systemDictUpdate.key,
              onSubmit: async (editValue, record) => {
                await api.api.v1["system-dict"]({ id: record.id })[
                  "fastUpdate"
                ].put({ active: editValue });
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
