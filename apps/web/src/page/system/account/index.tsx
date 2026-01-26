import { api } from "@/api";
import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { getSelectTreeAllNodeIds, transformSelectTreeData } from "@/util";
import {
  Card,
  ResizeGroup,
  ResizeHandler,
  ResizeItem,
  Toast,
  Tree,
} from "@douyinfe/semi-ui";
import { PASSWORD_PATTERN } from "@rojer/mf-common";
import { useRequest } from "ahooks";
import { useMemo, useRef, useState } from "react";

export const SystemAccountPage = () => {
  const tableRef = useRef<SchemaTableInstance>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [initValues, setInitValues] = useState<any>({});
  const [targetAccount, setTargetAccount] = useState<any>(null);
  const [departExpandedRowKeys, setDepartExpandedRowKeys] = useState<string[]>(
    [],
  );
  const [formExpandedRowKeys, setFormExpandedRowKeys] = useState<string[]>([]);

  const [currentDepartId, setCurrentDepartId] = useState<string | undefined>(
    undefined,
  );

  const { data: options } = useRequest<
    { roles: any[]; departments: any[] },
    []
  >(api.api.v1["system-account"].options.get, {
    onSuccess: ({ departments = [] }) => {
      setDepartExpandedRowKeys(getSelectTreeAllNodeIds(departments || []));
    },
  });

  const treeSelectData = useMemo(() => {
    return transformSelectTreeData(options?.departments || []);
  }, [options?.departments]);

  const onSubmit = async (value: any) => {
    if (initValues?.id) {
      await api.api.v1["system-account"]({
        id: initValues.id,
      }).put(value);
      Toast.success("修改成功");
    } else {
      await api.api.v1["system-account"].post(value);
      Toast.success("创建成功");
    }
    tableRef.current?.refresh?.();
    setModalVisible(false);
  };

  const onResetPassword = async (value: any) => {
    await api.api.v1["system-account"]({
      id: targetAccount.id,
    })["reset-password"].put(value);
    Toast.success("密码已重置");
    setResetPasswordVisible(false);
  };

  const onOpenEditModal = (value: any) => {
    setInitValues(value);
    setFormExpandedRowKeys(getSelectTreeAllNodeIds(options?.departments || []));
    setModalVisible(true);
  };

  const onCloseEditModal = () => {
    setInitValues({});
    setModalVisible(false);
  };

  return (
    <>
      <SchemaForm
        layout="modal"
        modalProps={{
          visible: modalVisible,
          onCancel: () => {
            onCloseEditModal();
          },
          title: `${initValues?.id ? "编辑" : "创建"}系统账户`,
          width: 600,
        }}
        initValues={initValues}
        onSubmit={onSubmit}
        columns={[
          {
            type: "group",
            props: {
              span: 12,
            },
            columns: [
              {
                dataIndex: "account",
                title: "账户名",
                required: true,
                props: {
                  readonly: !!initValues?.id,
                  disabled: !!initValues?.id,
                },
              },
              {
                dataIndex: "password",
                title: "密码",
                required: !initValues?.id,
                type: !initValues?.id ? "input" : "hidden",
                props: {
                  rules: !initValues?.id
                    ? [
                        {
                          message: "密码必须8位以上且不能过于简单",
                          type: "string",
                          pattern: PASSWORD_PATTERN,
                          min: 8,
                        },
                      ]
                    : [],
                },
              },
              {
                dataIndex: "realName",
                title: "用户昵称",
                required: true,
              },

              {
                dataIndex: "departmentId",
                title: "归属部门",
                type: "tree-select",
                width: "100%",
                required: true,
                props: {
                  treeData: treeSelectData,
                  placeholder: "请选择归属部门",
                  expandedKeys: formExpandedRowKeys,
                  onExpand: (_expandedKeys) =>
                    setFormExpandedRowKeys(_expandedKeys),
                },
              },
              {
                dataIndex: "isSuper",
                title: "超级管理员",
                type: "switch",
                required: true,
              },

              {
                dataIndex: "role",
                title: "角色",
                deps: ["isSuper"],
                type: ({ values }) => (values?.isSuper ? "hidden" : "select"),
                required: ({ values }) => (values?.isSuper ? false : true),
                props: {
                  labelKey: "name",
                  valueKey: "id",
                  multiple: true,
                  options: options?.roles || [],
                },
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

              {
                dataIndex: "phone",
                title: "手机号",
              },
              {
                dataIndex: "mail",
                title: "邮箱",
              },
            ],
          },
        ]}
      />

      <SchemaForm
        layout="modal"
        modalProps={{
          visible: resetPasswordVisible,
          onCancel: () => {
            setResetPasswordVisible(false);
            setTargetAccount(null);
          },
          title: `重置密码 - ${targetAccount?.realName || targetAccount?.account}`,
        }}
        initValues={{}}
        onSubmit={onResetPassword}
        columns={[
          {
            dataIndex: "newPassword",
            title: "新密码",
            required: true,
            props: {
              rules: [
                {
                  message: "密码必须8位以上且不能过于简单",
                  type: "string",
                  pattern: PASSWORD_PATTERN,
                  min: 8,
                },
              ],
            },
          },
        ]}
      />
      <>
        <ResizeGroup direction="horizontal">
          <ResizeItem defaultSize={"300px"} min={"200px"}>
            <Card style={{ minHeight: 600 }}>
              <Tree
                treeData={treeSelectData}
                expandedKeys={departExpandedRowKeys}
                onExpand={(_expandedKeys) =>
                  setDepartExpandedRowKeys(_expandedKeys)
                }
                onChange={(_currentId) =>
                  setCurrentDepartId(_currentId as string)
                }
                searchPlaceholder="情输入部门名称"
                filterTreeNode
              />
            </Card>
          </ResizeItem>
          <ResizeHandler
            style={{ paddingTop: 200, backgroundColor: "transparent" }}
          ></ResizeHandler>
          <ResizeItem>
            <SchemaTable
              title="系统账户"
              tableRef={tableRef}
              request={(param) =>
                api.api.v1["system-account"].read.post({
                  ...param,
                  where: [
                    ...(param?.where || []),
                    ...(currentDepartId
                      ? [{ key: "departmentId", value: currentDepartId }]
                      : []),
                  ],
                })
              }
              createAccess="system:account:create"
              updateAccess="system:account:update"
              deleteAccess="system:account:delete"
              onCreate={() => {
                onOpenEditModal({});
              }}
              refreshDeps={[currentDepartId]}
              onUpdate={(record) => {
                onOpenEditModal(record);
              }}
              onDelete={async (record) => {
                await api.api.v1["system-account"]({ id: record.id }).delete();
                Toast.success("删除成功");
                tableRef.current?.refresh?.();
              }}
              columns={[
                { dataIndex: "id", title: "ID" },
                {
                  dataIndex: "account",
                  title: "账户名",
                  showInFilter: true,
                  operator: "like",
                },
                {
                  dataIndex: "realName",
                  title: "用户昵称",
                  showInFilter: true,
                  operator: "like",
                },
                { dataIndex: "mail", title: "邮箱" },
                {
                  dataIndex: "role",
                  title: "角色",
                  width: 150,
                },
                {
                  dataIndex: "active",
                  title: "状态",
                  type: "switch",
                  showInFilter: true,
                  width: 80,
                  props: {
                    options: [
                      { label: "启用", value: true },
                      { label: "禁用", value: false },
                    ],
                  },
                },
                { dataIndex: "loginCount", title: "登录次数", width: 100 },
                { dataIndex: "lastIp", title: "最后登录IP", width: 140 },
                {
                  dataIndex: "lastTime",
                  title: "最后登录时间",
                  type: "datetime",
                  width: 180,
                },
                {
                  dataIndex: "createdAt",
                  title: "创建时间",
                  type: "datetime",
                  sorter: true,
                  width: 180,
                },
                {
                  type: "action",
                  width: 100,
                  tableActionRender: (record: any) => [
                    {
                      key: "resetPassword",
                      text: "重置密码",
                      permission: "system:account:resetPassword",
                      onClick: () => {
                        setTargetAccount(record);
                        setResetPasswordVisible(true);
                      },
                    },
                  ],
                },
              ]}
            />
          </ResizeItem>
        </ResizeGroup>
      </>
    </>
  );
};
