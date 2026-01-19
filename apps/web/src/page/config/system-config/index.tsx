import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { Toast } from "@douyinfe/semi-ui";
import { useRef, useState } from "react";
import { api, apiProxy } from "../../../api";

export const SystemConfigPage = () => {
  const tableRef = useRef<SchemaTableInstance>(undefined);
  const [editVisible, setEditVisible] = useState(false);
  const [initValues, setInitValues] = useState<any>({});

  const onSubmit = async (value: any) => {
    if (initValues?.id) {
      await apiProxy(
        api.api.v1["system-config"]({
          id: initValues.id,
        }).put,
      )(value);
      Toast.success("修改成功");
    } else {
      await apiProxy(api.api.v1["system-config"].post)(value);
      Toast.success("创建成功");
    }

    tableRef.current?.refresh?.();
    setEditVisible(false);
  };

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
          title: `${initValues?.id ? "编辑" : "创建"}系统配置`,
        }}
        initValues={initValues}
        onSubmit={onSubmit}
        columns={[
          {
            dataIndex: "name",
            title: "参数名称",
            required: true,
          },
          {
            dataIndex: "key",
            title: "参数键名",
            required: true,
            props: {
              extraText: "唯一标识设定后不可修改",
              readonly: !!initValues?.id,
              disabled: !!initValues?.id,
            },
          },
          {
            dataIndex: "value",
            title: "参数键值",
            required: true,
            type: "textarea",
            props: {
              rows: 3,
            },
          },
          {
            dataIndex: "buildIn",
            title: "内置",
            type: "switch",
            props: {
              disabled: true,
            },
          },
          {
            dataIndex: "note",
            title: "备注",
            type: "textarea",
            props: {
              rows: 2,
              maxLength: 512,
            },
          },
        ]}
      />
      <SchemaTable
        title="系统配置"
        tableRef={tableRef}
        request={apiProxy(api.api.v1["system-config"].read.post)}
        updateAccess="system:config:update"
        createAccess="system:config:create"
        deleteAccess="system:config:delete"
        onUpdate={(record) => {
          setInitValues(record);
          setEditVisible(true);
        }}
        onCreate={() => {
          setInitValues({});
          setEditVisible(true);
        }}
        onDelete={async (record) => {
          await api.api.v1["system-config"]({ id: record.id }).delete();
          Toast.success("删除成功");
          tableRef.current?.refresh?.();
        }}
        columns={[
          { dataIndex: "id", title: "ID" },
          {
            dataIndex: "name",
            title: "参数名称",
            showInFilter: true,
            operator: "like",
          },
          {
            dataIndex: "key",
            title: "参数键名",
            showInFilter: true,
            operator: "like",
          },
          {
            dataIndex: "value",
            title: "参数键值",
            width: 300,
            ellipsis: true,
          },
          {
            dataIndex: "buildIn",
            title: "内置",
            type: "switch",
            showInFilter: true,
            width: 80,
          },
          {
            dataIndex: "note",
            title: "备注",
            width: 200,
            ellipsis: true,
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
