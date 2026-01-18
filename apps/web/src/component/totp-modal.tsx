import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useEffect, useRef } from "react";

import { SchemaForm } from "@/component/schema/form";

export const TotpModal = ({
  visible,
  onCancel,
  onSuccess,
}: {
  visible: boolean;
  onCancel: any;
  onSuccess: any;
}) => {
  const formApi = useRef<FormApi>();

  useEffect(() => {
    if (visible) {
      formApi.current?.reset();
    }
  }, [visible]);

  const onSubmit = async (value: any) => {
    if (!value.code) {
      return;
    }
    onSuccess?.(value.code);
  };

  return (
    <SchemaForm
      modalProps={{
        visible,
        onCancel,
        title: `请输入`,
        okText: `确认`,
      }}
      layout="modal"
      getFormApi={(e) => (formApi.current = e)}
      onSubmit={onSubmit}
      columns={[
        {
          dataIndex: "code",
          required: true,
          noLabel: true,
          props: {
            placeholder: "六位临时验证码",
            size: "large",
          },
        },
      ]}
    />
  );
};
