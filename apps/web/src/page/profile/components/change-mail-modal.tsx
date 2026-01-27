import { Toast } from "@douyinfe/semi-ui";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useEffect, useRef, useState } from "react";

import { api } from "@/api";
import { SchemaForm } from "@/component/schema/form";
import { TimerButton } from "@/component/timer-button";
import { BusinessError } from "@/exception/business.error";
import { useRequest } from "ahooks";

export const ChangeMailModal = ({
  visible,
  onCancel,
  mode = "bind",
  onSuccess,
  mail,
}: {
  visible: boolean;
  onCancel: any;
  onSuccess: any;
  mode: "bind" | "unbind";
  mail?: string;
}) => {
  const isCodeSend = useRef<boolean>(false);
  const [rid, setRid] = useState(1);
  const formApi = useRef<FormApi>(undefined);

  useEffect(() => {
    if (visible) {
      setRid((r) => r + 1);
      formApi.current?.reset();
      isCodeSend.current = false;
    }
  }, [visible]);

  const { loading: mailLoading, runAsync: sendMailCode } = useRequest(
    api.api.v1.auth.mail.post,
    {
      manual: true,
      onSuccess: () => {
        isCodeSend.current = true;
        Toast.success("验证码发送成功");
      },
    },
  );

  const onSubmit = async (value: any) => {
    if (!isCodeSend.current) {
      Toast.warning("请先发送验证码");
      throw new BusinessError("请先发送验证码");
    }
    await api.api.v1.auth.mail.put(value);
    isCodeSend.current = false;
  };

  return (
    <SchemaForm
      modalProps={{
        visible,
        onCancel,
        title: `${mode === "unbind" ? "解绑" : "绑定"}邮箱`,
        okType: mode === "unbind" ? "danger" : "primary",
        okText: `${mode === "unbind" ? "解绑" : "绑定"}`,
      }}
      layout="modal"
      getFormApi={(e) => (formApi.current = e)}
      onSubmit={onSubmit}
      onSuccess={() => {
        Toast.success(`${mode === "unbind" ? "解绑" : "绑定"}邮箱成功`);
        onSuccess?.();
      }}
      key={rid}
      columns={[
        {
          dataIndex: "mail",
          title: "邮箱",
          required: true,
          props: {
            placeholder: mode === "bind" ? "请输入您要绑定的邮箱" : "",
            readonly: mode === "unbind",
            initValue: mail,
            addonAfter: (
              <TimerButton
                loading={mailLoading}
                onClick={async () => {
                  const mail = formApi.current?.getValue("mail");
                  if (mail) {
                    await sendMailCode({ mail });
                    formApi.current?.setValue("code", undefined);
                    return true;
                  }

                  return false;
                }}
                size="small"
              >
                发送验证码
              </TimerButton>
            ),
          },
        },
        {
          dataIndex: "code",
          title: "验证码",
          required: true,
        },
      ]}
    />
  );
};
