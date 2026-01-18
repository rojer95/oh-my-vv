import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { SchemaColumn } from "@/component/schema/typing";
import { adminModel } from "@/mobx/admin";
import { Toast } from "@douyinfe/semi-ui";
import { useRequest } from "ahooks";
import { pick } from "lodash-es";
import { useMemo, useRef, useState } from "react";
import { api } from "../../../api/index";

export const AdminPage = () => {
  const tableRef = useRef<SchemaTableInstance>();
  const [editVisible, setEditVisible] = useState(false);
  const [mode, setMode] = useState<"create" | "update" | "reset">("create");
  const [initValues, setInitValues] = useState<any>({});
  const { data: options } = useRequest(api.v1.admin.options);
  const columns = useMemo<SchemaColumn[]>(() => {
    if (mode === "create") {
      return [
        {
          type: "group",
          columns: [
            {
              dataIndex: "account",
              title: "登录账号",
              required: true,
              width: 195,
            },
            {
              dataIndex: "password",
              title: "登录密码",
              required: true,
              width: 195,
            },
          ],
        },

        { dataIndex: "realName", title: "名称", required: true },
        {
          type: "group",
          columns: [
            { dataIndex: "mail", title: "邮箱", width: 195 },
            { dataIndex: "phone", title: "电话", width: 195 },
          ],
        },
        {
          type: "group",
          columns: [
            {
              dataIndex: "isSuper",
              title: "超级权限",
              type: "switch",
              width: 195,
            },
            {
              dataIndex: "roles",
              title: "角色",
              deps: ["isSuper"],
              type: ({ values }) => (values?.isSuper ? "hidden" : "select"),
              props: {
                multiple: true,
                options: options?.role,
                showClear: true,
              },
              width: 195,
            },
          ],
        },
      ];
    }

    if (mode === "update") {
      return [
        { dataIndex: "realName", title: "名称", required: true },
        {
          type: "group",
          columns: [
            { dataIndex: "mail", title: "邮箱", width: 195 },
            { dataIndex: "phone", title: "电话", width: 195 },
          ],
        },
        {
          type: "group",
          columns: [
            {
              dataIndex: "isSuper",
              title: "超级管理员",
              type: "switch",
              width: 195,
            },
            {
              dataIndex: "roles",
              title: "角色",
              deps: ["isSuper"],
              type: ({ values }) => (values?.isSuper ? "hidden" : "select"),
              props: {
                multiple: true,
                options: options?.role,
                showClear: true,
              },
              width: 195,
            },
          ],
        },
      ];
    }

    if (mode === "reset") {
      return [{ dataIndex: "password", title: "新密码", required: true }];
    }

    return [];
  }, [mode, options?.role]);

  const modalTitle = useMemo(() => {
    if (mode === "create") {
      return "创建";
    }

    if (mode === "update") {
      return "修改";
    }

    if (mode === "reset") {
      return "重置密码";
    }
    return "";
  }, [mode]);

  const onSubmit = async (value: any) => {
    if (mode === "update") {
      await api.v1.admin.update(initValues.id, value);
      Toast.success("修改成功");
      adminModel.loadProfile();
    }

    if (mode === "create") {
      await api.v1.admin.create(value);
      Toast.success("创建成功");
    }

    if (mode === "reset") {
      await api.v1.admin.resetPassword(initValues.id, value.password);
      Toast.success("重置密码成功");
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
          title: modalTitle,
        }}
        initValues={initValues}
        onSubmit={onSubmit}
        columns={columns}
      />

      <SchemaTable
        title="账号"
        tableRef={tableRef}
        request={api.v1.admin.read}
        updateAccess="admin.update"
        createAccess="admin.create"
        deleteAccess="admin.delete"
        onUpdate={(record) => {
          setMode("update");
          setInitValues(
            pick(record, [
              "id",
              "realName",
              "isSuper",
              "roles",
              "phone",
              "mail",
            ])
          );
          setEditVisible(true);
        }}
        onCreate={() => {
          setMode("create");
          setInitValues({});
          setEditVisible(true);
        }}
        onDelete={async (record) => {
          await api.v1.admin.del(record.id);
          tableRef.current?.refresh?.();
        }}
        columns={[
          { dataIndex: "id", title: "ID" },
          {
            dataIndex: "realName",
            title: "名称",
            showInFilter: true,
            operator: "like",
          },
          {
            dataIndex: "account",
            title: "账号",
            showInFilter: true,
          },
          { dataIndex: "isSuper", title: "超级权限", type: "switch" },
          {
            dataIndex: "active",
            title: "有效",
            type: "fast-radio",
            props: {
              permission: "admin.update",
              onSubmit: async (editValue, record) => {
                await api.v1.admin.updateActive(record.id, editValue);
                tableRef.current?.refresh?.();
              },
            },
          },
          {
            dataIndex: "roles",
            title: "角色",
            type: "select",
            props: {
              multiple: true,
              options: options?.role,
            },
          },
          {
            dataIndex: "loginCount",
            title: "登录次数",
            width: 90,
          },
          {
            dataIndex: "lastIp",
            title: "登录Ip",
            width: 200,
          },
          {
            dataIndex: "lastTime",
            title: "登录时间",
            type: "datetime",
            width: 200,
          },
          {
            type: "action",
            width: 120,
            tableActionRender: (record) => {
              return [
                {
                  text: "重置密码",
                  permission: "admin.reset-password",
                  onClick: () => {
                    setMode("reset");
                    setInitValues(pick(record, ["id"]));
                    setEditVisible(true);
                  },
                  key: "reset",
                },
              ];
            },
          },
        ]}
      />
    </>
  );
};
