import { api } from "@/api";
import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { Toast } from "@douyinfe/semi-ui";
import { PERMISSIONS } from "@rojer/mf-common";
import { useRef, useState } from "react";

export const SystemConfigPage = () => {
  const tableRef = useRef<SchemaTableInstance>(undefined);
  const [editVisible, setEditVisible] = useState(false);
  const [initValues, setInitValues] = useState<any>({});

  const onSubmit = async (value: any) => {
    if (initValues?.id) {
      await api.api.v1["system-config"]({
        id: initValues.id,
      }).put(value);
      Toast.success("修改成功");
    } else {
      await api.api.v1["system-config"].post(value);
      Toast.success("创建成功");
    }

    tableRef.current?.refresh?.();
    setEditVisible(false);
  };

  const onDelete = async (id: number) => {
    await api.api.v1["system-config"]({ id }).delete();
    Toast.success("删除成功");
    tableRef.current?.refresh?.();
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
            deps: ["buildIn"],
            props: ({ values }) => {
              return {
                disabled: values.buildIn === true,
              };
            },
          },
          {
            dataIndex: "key",
            title: "参数键名",
            required: true,
            props: {
              extraText: "参数键名设定后不可修改",
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
            deps: ["buildIn"],
            props: ({ values }) => {
              return {
                rows: 2,
                maxLength: 512,
                disabled: values.buildIn === true,
              };
            },
          },
        ]}
      />
      <SchemaTable
        title="系统配置"
        tableRef={tableRef}
        request={api.api.v1["system-config"].read.post}
        createAccess="system:config:create"
        onCreate={() => {
          setInitValues({});
          setEditVisible(true);
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
            tableActionRender: (record) => {
              return [
                {
                  key: "edit",
                  text: "编辑",
                  permission: PERMISSIONS.systemDepartmentUpdate.key,
                  onClick: () => {
                    setInitValues(record);
                    setEditVisible(true);
                  },
                },
                {
                  key: "del",
                  text: "删除",
                  disabled: record.buildIn,
                  popconfirmProps: {
                    title: "操作确认",
                    content: "是否确认要删除该条数据？",
                    okType: "danger",
                    okText: "确认删除",
                  },
                  type: "danger",
                  permission: PERMISSIONS.systemConfigDelete.key,
                  onClick: async () => {
                    onDelete(record.id);
                  },
                },
              ];
            },
          },
        ]}
      />
    </>
  );
};
