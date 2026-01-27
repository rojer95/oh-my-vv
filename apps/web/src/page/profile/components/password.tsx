import { Toast } from "@douyinfe/semi-ui";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useEffect, useRef } from "react";

import { SchemaForm } from "@/component/schema/form";

import { adminModel } from "@/mobx/admin";
import { api } from "@/api";

export const ChangePasswordModal = ({
  visible,
  onCancel,
}: {
  visible: boolean;
  onCancel: any;
}) => {
  const formApi = useRef<FormApi>(undefined);

  useEffect(() => {
    if (visible) formApi.current?.reset();
  }, [visible]);

  return (
    <SchemaForm
      modalProps={{
        visible,
        onCancel,
        title: "修改密码",
      }}
      layout="modal"
      getFormApi={(e) => (formApi.current = e)}
      onSubmit={async (values) => {
        await api.api.v1.auth.password.put(values);
      }}
      onSuccess={() => {
        Toast.success("修改成功，请您重新登陆");
        adminModel.logout();
      }}
      columns={[
        {
          dataIndex: "oldpassword",
          title: "旧密码",
          required: true,
          props: { mode: "password" },
        },
        {
          dataIndex: "password",
          title: "新密码",
          required: true,
          min: 8,
          props: {
            mode: "password",
          },
        },
        {
          dataIndex: "repassword",
          title: "重复新密码",
          required: true,
          props: {
            mode: "password",
            rules: [
              {
                validator: (_, value) => {
                  return value === formApi.current?.getValue("password");
                },
                message: "两次密码输入不一致",
              },
            ],
          },
        },
      ]}
    />
  );
};
