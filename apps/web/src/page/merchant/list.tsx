import { Toast } from "@douyinfe/semi-ui";

import { pick } from "lodash-es";
import { useMemo, useRef, useState } from "react";

import { SchemaForm } from "@/component/schema/form";
import { SchemaTable, SchemaTableInstance } from "@/component/schema/table";
import { adminModel } from "@/mobx/admin";
import { AccountType, GET_STORAGE_AUTH_KEY } from "@fshop/shared";
import { api } from "../../api";

export const MerchantListPage = () => {
  const tableRef = useRef<SchemaTableInstance>();
  const [editVisible, setEditVisible] = useState(false);
  const [mode, setMode] = useState<"create" | "update" | "reset">("create");
  const [initValues, setInitValues] = useState<any>({});

  const columns = useMemo(() => {
    if (mode === "create") {
      return [
        { dataIndex: "name", title: "商户名称", required: true },
        { dataIndex: "realName", title: "联系人名称", required: true },
        { dataIndex: "phone", title: "电话", required: true },
        { dataIndex: "account", title: "管理员账号", required: true },
        { dataIndex: "password", title: "管理员密码", required: true },
      ];
    }

    if (mode === "update") {
      return [
        { dataIndex: "name", title: "商户名称", required: true },
        { dataIndex: "realName", title: "联系人名称", required: true },
        { dataIndex: "phone", title: "电话", required: true },
      ];
    }

    return [];
  }, [mode]);

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
      await api.v1.merchant.update(initValues.id, value);
      Toast.success("修改成功");
    }

    if (mode === "create") {
      await api.v1.merchant.create(value);
      Toast.success("创建成功");
    }

    adminModel.loadProfile();
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
        title="商户"
        tableRef={tableRef}
        request={api.v1.merchant.read}
        updateAccess="merchant.update"
        createAccess="merchant.create"
        deleteAccess="merchant.delete"
        onUpdate={(record) => {
          setMode("update");
          setInitValues(
            pick(record, [
              "id",
              "name",
              "realName",
              "phone",
              "logo",
              "desc",
              "address",
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
          await api.v1.merchant.del(record.id);
          tableRef.current?.refresh?.();
        }}
        columns={[
          { dataIndex: "id", title: "ID" },
          {
            dataIndex: "name",
            title: "商户名称",
            showInFilter: true,
            operator: "like",
          },
          {
            dataIndex: "realName",
            title: "联系人",
            showInFilter: true,
            operator: "like",
          },

          {
            dataIndex: "phone",
            title: "联系电话",
            showInFilter: true,
          },

          {
            type: "action",
            width: 120,
            tableActionRender: (record) => {
              return [
                {
                  text: "进入后台",
                  permission: "merchant.enter",
                  key: "merchant",
                  onClick: async () => {
                    const { token } = await api.v1.merchant.enter(record.id);
                    const MERCHANT_STORAGE_AUTH_KEY = GET_STORAGE_AUTH_KEY(
                      AccountType.merchant
                    );
                    localStorage.removeItem(MERCHANT_STORAGE_AUTH_KEY);
                    sessionStorage.removeItem(MERCHANT_STORAGE_AUTH_KEY);
                    sessionStorage[MERCHANT_STORAGE_AUTH_KEY] = token;
                    location.href = `${location.origin}/merchant.html#/dashboard`;
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
