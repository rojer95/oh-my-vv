import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { Modal, Toast } from "@douyinfe/semi-ui";
import { useRef, useState } from "react";
import { DictDetailPage } from "./dict-detail";
import { api } from "../../../api";

export const DictPage = () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentDict, setCurrentDict] = useState<any>(null);
  const tableRef = useRef<SchemaTableInstance>();
  const [editVisible, setEditVisible] = useState(false);
  const [initValues, setInitValues] = useState<any>({});

  const onSubmit = async (value: any) => {
    if (initValues?.id) {
      await api.v1.dict.update(initValues.id, value);
      Toast.success("修改成功");
    }

    if (!initValues?.id) {
      await api.v1.dict.create(value);
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
        title={`${currentDict?.dictName || ""}-数据字典`}
        fullScreen
      >
        <DictDetailPage dictKey={currentDict?.dictKey} />
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
            dataIndex: "dictKey",
            title: "唯一标识",
            required: true,

            props: {
              extraText: "唯一标识设定后不可修改",
              readonly: !!initValues?.id,
              disabled: !!initValues?.id,
              rules: [
                {
                  type: "string",
                  pattern: /^[a-zA-Z][a-zA-Z\d-_]+$/,
                  message: "仅支持 字母数字 组成 且需要以字母开头",
                },
              ],
            },
          },
          { dataIndex: "dictName", title: "名称", required: true },
        ]}
      />
      <SchemaTable
        title="数据字典"
        tableRef={tableRef}
        request={api.v1.dict.read}
        updateAccess="dict.update"
        createAccess="dict.create"
        deleteAccess="dict.delete"
        onUpdate={(record) => {
          setInitValues(record);
          setEditVisible(true);
        }}
        onCreate={() => {
          setInitValues({});
          setEditVisible(true);
        }}
        onDelete={async (record) => {
          await api.v1.dict.del(record.id);
          tableRef.current?.refresh?.();
        }}
        columns={[
          { dataIndex: "id", title: "ID" },
          {
            dataIndex: "dictKey",
            title: "唯一标识",
          },
          {
            dataIndex: "dictName",
            title: "名称",
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
            tableActionRender: (record) => {
              return [
                {
                  text: "管理详情",
                  permission: "dict-detail.read",
                  onClick: () => {
                    setCurrentDict(record);
                    setDetailVisible(true);
                  },
                  key: "read",
                },
              ];
            },
          },
        ]}
      />
    </>
  );
};
