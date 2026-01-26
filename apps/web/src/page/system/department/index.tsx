import { api } from "@/api";
import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { TableRowActionProps } from "@/component/schema/typing";
import { getSelectTreeAllNodeIds, transformSelectTreeData } from "@/util";
import { Toast } from "@douyinfe/semi-ui";
import { PERMISSIONS } from "@rojer/mf-common";
import { useRequest } from "ahooks";
import { useEffect, useMemo, useRef, useState } from "react";

export const DepartmentPage = () => {
  const tableRef = useRef<SchemaTableInstance>(undefined);
  const [editVisible, setEditVisible] = useState(false);
  const [initValues, setInitValues] = useState<any>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>(
    [],
  );

  const [formExpandedRowKeys, setFormExpandedRowKeys] = useState<
    (string | number)[]
  >([]);
  const { data: treeData, refresh } = useRequest<any[], []>(
    api.api.v1["system-department"].tree.get,
  );

  const treeSelectData = useMemo(() => {
    return transformSelectTreeData(treeData || [], initValues?.path);
  }, [treeData, initValues?.id]);

  const allExpandedKeys = useMemo(() => {
    return getSelectTreeAllNodeIds(treeData || [], false);
  }, [treeData]);

  useEffect(() => {
    setExpandedRowKeys(allExpandedKeys);
  }, [allExpandedKeys]);

  const onOpenEditModal = (value: any) => {
    setInitValues(value);
    setFormExpandedRowKeys(getSelectTreeAllNodeIds(treeData || []));
    setEditVisible(true);
  };

  const onSubmit = async (value: any) => {
    if (initValues?.id) {
      const res = await api.api.v1["system-department"]({
        id: initValues.id,
      }).put(value);
      console.log("res", res);

      Toast.success("修改成功");
    } else {
      await api.api.v1["system-department"].post(value);
      Toast.success("创建成功");
    }

    refresh();
  };

  const onDelete = async (id: number) => {
    await api.api.v1["system-department"]({ id }).delete();
    Toast.success("删除成功");
    refresh();
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
          title: `${initValues?.id ? "编辑" : "创建"}部门`,
        }}
        initValues={initValues}
        onSubmit={onSubmit}
        columns={[
          {
            dataIndex: "name",
            title: "部门名称",
            required: true,
          },
          {
            dataIndex: "parentId",
            title: "上级部门",
            type:
              initValues?.id && !initValues?.parentId
                ? "hidden"
                : "tree-select",
            width: "100%",
            required: true,
            props: {
              treeData: treeSelectData,
              placeholder: "请选择上级部门",
              expandedKeys: formExpandedRowKeys,
              onExpand: (_expandedKeys) =>
                setFormExpandedRowKeys(_expandedKeys),
            },
          },
          {
            dataIndex: "sort",
            title: "排序",
            type: "number",
          },
          {
            dataIndex: "active",
            title: "状态",
            type: "switch",
            props: {
              options: [
                { label: "启用", value: true },
                { label: "禁用", value: false },
              ],
            },
          },
        ]}
      />
      <SchemaTable
        title="部门"
        tableRef={tableRef}
        dataSource={treeData || []}
        pagination={false}
        expandedRowKeys={expandedRowKeys}
        onExpandedRowsChange={(rows) => {
          setExpandedRowKeys(rows?.map((i) => i.id) || []);
        }}
        createAccess="system:department:create"
        onRefresh={refresh}
        columns={[
          {
            dataIndex: "name",
            title: "部门名称",
          },
          {
            dataIndex: "active",
            title: "状态",
            type: "fast-radio",
            width: 60,
            props: {
              permission: "system:department:update",
              onSubmit: async (editValue, record) => {
                await api.api.v1["system-department"]({ id: record.id })[
                  "fastUpdate"
                ].put({ active: editValue });
                refresh();
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
                await api.api.v1["system-department"]({ id: record.id })[
                  "fastUpdate"
                ].put({ sort: editValue });
                refresh();
              },
            },
          },
          {
            dataIndex: "createdAt",
            title: "创建时间",
            type: "datetime",
            sorter: true,
            width: 80,
          },
          {
            type: "action",
            width: 60,
            tableActionRender: (record: any) => {
              const actions: TableRowActionProps[] = [
                {
                  key: "new",
                  text: "新增",
                  permission: PERMISSIONS.systemDepartmentCreate.key,
                  onClick: () => {
                    onOpenEditModal({ parentId: record.id });
                  },
                },

                {
                  key: "edit",
                  text: "编辑",
                  permission: PERMISSIONS.systemDepartmentUpdate.key,
                  onClick: () => {
                    onOpenEditModal({ ...record });
                  },
                },
              ];

              if (record.parentId) {
                actions.push({
                  key: "del",
                  text: "删除",
                  popconfirmProps: {
                    title: "操作确认",
                    content: "是否确认要删除该条数据？",
                    okType: "danger",
                    okText: "确认删除",
                  },
                  type: "danger",
                  permission: PERMISSIONS.systemDepartmentDelete.key,
                  onClick: async () => {
                    onDelete(record.id);
                  },
                });
              }
              return actions;
            },
          },
        ]}
      />
    </>
  );
};
