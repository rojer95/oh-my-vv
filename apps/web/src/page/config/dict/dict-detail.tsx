import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { Toast } from "@douyinfe/semi-ui";
import { useRef, useState } from "react";
import { api } from "../../../api";

export const DictDetailPage = ({ dictKey }: { dictKey: string }) => {
  const tableRef = useRef<SchemaTableInstance>();
  const [editVisible, setEditVisible] = useState(false);
  const [initValues, setInitValues] = useState<any>({});

  const onSubmit = async (value: any) => {
    if (initValues?.id) {
      await api.v1.dict.updateDetail(initValues.id, value);
      Toast.success("修改成功");
    }

    if (!initValues?.id) {
      await api.v1.dict.createDetail({ ...value, dictKey: dictKey });
      Toast.success("创建成功");
    }

    tableRef.current?.refresh?.();
  };

  if (!dictKey) return null;

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
            dataIndex: "value",
            title: "唯一标识",
            required: true,
            props: {
              extraText: "唯一标识设定后不可修改",
              readonly: !!initValues?.id,
              disabled: !!initValues?.id,
              rules: [
                {
                  type: "string",
                  pattern: /^[a-zA-Z][a-zA-Z\d]+$/,
                  message: "仅支持 字母数字 组成 且需要以字母开头",
                },
              ],
            },
          },
          { dataIndex: "label", title: "名称", required: true },
        ]}
      />
      <SchemaTable
        tableRef={tableRef}
        request={(args) =>
          api.v1.dict.readDetail({
            ...args,
            where: [...(args?.where || []), { key: "dictKey", value: dictKey }],
          })
        }
        updateAccess="dict-detail.update"
        createAccess="dict-detail.create"
        deleteAccess="dict-detail.delete"
        onUpdate={(record) => {
          setInitValues(record);
          setEditVisible(true);
        }}
        onCreate={() => {
          setInitValues({});
          setEditVisible(true);
        }}
        onDelete={async (record) => {
          await api.v1.dict.delDetail(record.id);
          tableRef.current?.refresh?.();
        }}
        columns={[
          { dataIndex: "id", title: "ID" },
          {
            dataIndex: "value",
            title: "唯一标识",
          },
          {
            dataIndex: "label",
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
          },
        ]}
      />
    </>
  );
};
