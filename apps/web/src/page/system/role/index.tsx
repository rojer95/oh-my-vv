import { api } from "@/api";
import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { useMainRoute } from "@/hook/route.hook";
import { adminModel } from "@/mobx/admin";
import {
  findRoute,
  getSelectTreeAllNodeIds,
  transformSelectTreeData,
} from "@/util";
import { Space, Tag, Toast } from "@douyinfe/semi-ui";
import {
  PERMISSIONS,
  RoleDataPermType,
  RoleDataPermTypeOptions,
} from "@rojer/mf-common";
import { useRequest } from "ahooks";
import { useMemo, useRef, useState } from "react";

export const RolePage = () => {
  const mainRoute = useMainRoute();
  const tableRef = useRef<SchemaTableInstance>(undefined);
  const [editVisible, setEditVisible] = useState(false);
  const [initValues, setInitValues] = useState<any>({});
  const { data: options } = useRequest<
    { permissions: any[]; departments: any[] },
    []
  >(api.api.v1["system-role"].options.get);
  const [formExpandedRowKeys, setFormExpandedRowKeys] = useState<string[]>([]);

  const treeSelectData = useMemo(() => {
    return transformSelectTreeData(options?.departments || []);
  }, [options?.departments]);

  const isInRoute = (item: any) => {
    return !!findRoute(mainRoute, (i) => {
      if (!i || !i.handle || !item) return false;
      return i.handle?.access === item.key;
    });
  };

  const onOpenEditModal = (value: any) => {
    setFormExpandedRowKeys(getSelectTreeAllNodeIds(options?.departments || []));
    setInitValues(value);
    setEditVisible(true);
  };

  const onCloseEditModal = () => {
    setInitValues({});
    setEditVisible(false);
  };

  const onSubmit = async (value: any) => {
    if (initValues?.id) {
      await api.api.v1["system-role"]({ id: initValues.id }).put(value);
      adminModel.loadProfile();
      Toast.success("修改成功");
    } else {
      await api.api.v1["system-role"].post(value);
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
            onCloseEditModal();
          },
          title: `${initValues?.id ? "编辑" : "创建"}角色`,
        }}
        initValues={initValues}
        onSubmit={onSubmit}
        columns={[
          { dataIndex: "name", title: "名称", required: true },
          { dataIndex: "sort", title: "排序", type: "number" },
          { dataIndex: "active", title: "状态", type: "active" },
          {
            dataIndex: "dataPermType",
            title: "数据权限",
            type: "select",
            props: {
              options: RoleDataPermTypeOptions,
            },
          },
          {
            dataIndex: "department",
            title: "自定义部门范围",
            width: "100%",
            props: {
              multiple: true,
              treeData: treeSelectData,
              expandedKeys: formExpandedRowKeys,
              checkRelation: "unRelated",
              onExpand: (_expandedKeys) =>
                setFormExpandedRowKeys(_expandedKeys),
            },
            deps: ["dataPermType"],
            required: ({ values }) =>
              [RoleDataPermType.custom].includes(values?.dataPermType),
            type: ({ values }) => {
              return [RoleDataPermType.custom].includes(values?.dataPermType)
                ? "tree-select"
                : "hidden";
            },
          },
          {
            dataIndex: "menuPerm",
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
              labelKey: "name",
              valueKey: "key",
              renderLabel: (_, item) => {
                return (
                  <Space>
                    {String(item?.name).indexOf("/") > 0
                      ? String(item?.name).split("/")[1]
                      : item?.name}
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
        request={api.api.v1["system-role"].read.post}
        updateAccess="system:role:update"
        createAccess="system:role:create"
        deleteAccess="system:role:delete"
        onUpdate={(record) => {
          onOpenEditModal(record);
        }}
        onCreate={() => {
          onOpenEditModal({});
        }}
        onDelete={async (record) => {
          await api.api.v1["system-role"]({ id: record.id }).delete();
          tableRef.current?.refresh?.();
        }}
        columns={[
          { dataIndex: "id", title: "ID" },
          {
            dataIndex: "name",
            title: "角色名称",
            showInFilter: true,
            operator: "like",
          },
          {
            dataIndex: "active",
            title: "状态",
            type: "active",
            props: {
              permission: PERMISSIONS.systemRoleUpdate.key,
              onSubmit: async (editValue, record) => {
                await api.api.v1["system-role"]({ id: record.id })[
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
              permission: PERMISSIONS.systemRoleUpdate.key,
              onSubmit: async (editValue, record) => {
                await api.api.v1["system-role"]({
                  id: record.id,
                }).fastUpdate.put({ sort: editValue });
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
