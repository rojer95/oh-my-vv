import { SchemaForm } from "@/component/schema/form";
import { SpinBox } from "@/component/spin-box";
import { Card, Toast } from "@douyinfe/semi-ui";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useRequest } from "ahooks";
import { useRef } from "react";
import { api } from "../../../api";

export const SettingSystemPage = () => {
  const formApi = useRef<FormApi>();
  const { data, loading, refresh } = useRequest(api.v1.system.getSetting);

  return (
    <Card>
      {loading ? (
        <SpinBox />
      ) : (
        <SchemaForm
          getFormApi={(api) => (formApi.current = api)}
          initValues={data}
          onSubmit={async (value) => {
            await api.v1.system.saveSetting(value);
            Toast.success("修改成功");
            refresh();
          }}
          columns={[
            {
              title: "登录有效期",
              dataIndex: "login.expired",
              type: "number",
              min: 1,
              props: {
                suffix: "天",
              },
            },
          ]}
        />
      )}
    </Card>
  );
};
