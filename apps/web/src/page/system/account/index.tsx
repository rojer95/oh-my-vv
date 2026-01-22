import { api, apiProxy } from "@/api";
import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { Tag, Toast } from "@douyinfe/semi-ui";
import { PASSWORD_PATTERN } from "@rojer/mf-common";
import { useRef, useState } from "react";

const mockRoles = [
  { id: 1, name: "超级管理员" },
  { id: 2, name: "管理员" },
  { id: 3, name: "编辑" },
  { id: 4, name: "查看者" },
];

const getRoleNames = (roleIds: number[]) => {
  return (
    roleIds
      ?.map((id) => mockRoles.find((r) => r.id === id)?.name)
      .filter(Boolean) || []
  );
};

export const SystemAccountPage = () => {
  const tableRef = useRef<SchemaTableInstance>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [initValues, setInitValues] = useState<any>({});
  const [targetAccount, setTargetAccount] = useState<any>(null);

  const onSubmit = async (value: any) => {
    if (initValues?.id) {
      await apiProxy(
        api.api.v1["system-account"]({
          id: initValues.id,
        }).put,
      )(value);
      Toast.success("修改成功");
    } else {
      await apiProxy(api.api.v1["system-account"].post)(value);
      Toast.success("创建成功");
    }
    tableRef.current?.refresh?.();
    setModalVisible(false);
  };

  const onResetPassword = async (value: any) => {
    await apiProxy(
      api.api.v1["system-account"]({
        id: targetAccount.id,
      })["reset-password"].put,
    )(value);
    Toast.success("密码已重置");
    setResetPasswordVisible(false);
  };

  return (
    <>
      <SchemaForm
        layout="modal"
        modalProps={{
          visible: modalVisible,
          onCancel: () => {
            setInitValues({});
            setModalVisible(false);
          },
          title: `${initValues?.id ? "编辑" : "创建"}系统账户`,
        }}
        initValues={initValues}
        onSubmit={onSubmit}
        columns={[
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
            title: "真实姓名",
            required: true,
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
              multiple: true,
              options: mockRoles.map((r) => ({
                value: r.id,
                label: r.name,
              })),
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

      <SchemaTable
        title="系统账户"
        tableRef={tableRef}
        request={apiProxy(api.api.v1["system-account"].read.post)}
        createAccess="system:account:create"
        updateAccess="system:account:update"
        deleteAccess="system:account:delete"
        onCreate={() => {
          setInitValues({});
          setModalVisible(true);
        }}
        onUpdate={(record) => {
          setInitValues(record);
          setModalVisible(true);
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
            title: "真实姓名",
            showInFilter: true,
            operator: "like",
          },
          { dataIndex: "phone", title: "手机号" },
          { dataIndex: "mail", title: "邮箱" },
          {
            dataIndex: "role",
            title: "角色",
            width: 150,
            render: (roles: number[]) =>
              getRoleNames(roles).map((name) => (
                <Tag key={name} color="blue">
                  {name}
                </Tag>
              )),
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
    </>
  );
};
