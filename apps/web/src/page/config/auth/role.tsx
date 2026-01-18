import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { useMainRoute } from "@/hook/route.hook";
import { adminModel } from "@/mobx/admin";
import { findRoute } from "@/util";
import { Space, Tag, Toast } from "@douyinfe/semi-ui";
import { useRequest } from "ahooks";
import { useRef, useState } from "react";
import { api } from "../../../api/index";

export const RolePage = () => {
  const mainRoute = useMainRoute();
  const tableRef = useRef<SchemaTableInstance>(undefined);
  const [editVisible, setEditVisible] = useState(false);
  const [initValues, setInitValues] = useState<any>({});
  const { data: options } = useRequest(api.v1.role.options);

  const isInRoute = (item: any) => {
    return !!findRoute(mainRoute, (i) => {
      if (!i || !i.handle || !item) return false;
      return i.handle?.access === item.key;
    });
  };

  const onSubmit = async (value: any) => {
    if (initValues?.id) {
      await api.v1.role.update(initValues.id, value);
      adminModel.loadProfile();
      Toast.success("修改成功");
    }

    if (!initValues?.id) {
      await api.v1.role.create(value);
      Toast.success("创建成功");
    }

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
          title: `${initValues?.id ? "编辑" : "创建"}`,
        }}
        initValues={initValues}
        onSubmit={onSubmit}
        columns={[
          { dataIndex: "roleName", title: "名称", required: true },
          {
            dataIndex: "rules",
            title: "权限集",
            required: true,
            type: "tree",
            width: "100%",
            props: {
              treeData: options?.permissions || [],
              multiple: true,
              leafOnly: true,
              expandAll: true,
              virtualize: {
                itemSize: 28,
                height: 336,
              },
              renderLabel: (label, item) => {
                return (
                  <Space>
                    {String(label).indexOf("/") > 0
                      ? String(label).split("/")[1]
                      : label}
                    {isInRoute(item) ? <Tag color="blue">页面权限</Tag> : null}
                  </Space>
                );
              },
            },
          },
        ]}
      />
      <SchemaTable
        title="角色"
        tableRef={tableRef}
        request={api.v1.role.read}
        updateAccess="role.update"
        createAccess="role.create"
        deleteAccess="role.delete"
        onUpdate={(record) => {
          setInitValues(record);
          setEditVisible(true);
        }}
        onCreate={() => {
          setInitValues({});
          setEditVisible(true);
        }}
        onDelete={async (record) => {
          await api.v1.role.del(record.id);
          tableRef.current?.refresh?.();
        }}
        columns={[
          { dataIndex: "id", title: "ID" },
          {
            dataIndex: "roleName",
            title: "角色名称",
            showInFilter: true,
            operator: "like",
          },
          {
            dataIndex: "active",
            title: "有效",
            type: "fast-radio",
            props: {
              permission: "role.update",
              onSubmit: async (editValue, record) => {
                await api.v1.role.fastUpdate(record.id, {
                  active: editValue,
                });
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
