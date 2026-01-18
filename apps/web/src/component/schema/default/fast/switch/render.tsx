import { Switch } from "@douyinfe/semi-ui";
import { useMemo, useState } from "react";

import { optionsUtils } from "@/component/schema/util";
import { usePermissions } from "@/hook/permission.hook";
import { checkAccess } from "@/util";
import { observer } from "mobx-react-lite";

import styled from "styled-components";
import "../fast.less";

const defaultOptions = [
  {
    label: "是",
    value: true,
  },
  {
    label: "否",
    value: false,
  },
];

const SwitchStyled = styled(Switch)<{ textLength: number }>`
  .semi-switch-checked-text,
  .semi-switch-unchecked-text {
    white-space: nowrap;
    transform: scale(${(props) => (props.textLength > 1 ? "0.7" : "1")});
  }
`;
export const FastSwitch = observer((props: any) => {
  const { permissions } = usePermissions();

  const [loading, setLoading] = useState<boolean>(false);

  const submit = async (value: any) => {
    setLoading(true);
    try {
      await props?.onSubmit?.(value, props.record);
    } finally {
      setLoading(false);
    }
  };

  const options = useMemo(() => {
    return optionsUtils.transfrom(props.options ?? defaultOptions);
  }, [props.options, defaultOptions]);

  return (
    <SwitchStyled
      loading={loading}
      checkedText={options?.find?.((i) => i.value === true)?.label}
      uncheckedText={options?.find?.((i) => i.value === false)?.label}
      checked={!!props.value}
      onChange={(v) => {
        if (props.permission && !checkAccess(props.permission, permissions)) {
          return;
        }
        submit(v);
      }}
      textLength={Math.max(
        props.options?.find?.((i: any) => i.value === true)?.label?.length || 1,
        props.options?.find?.((i: any) => i.value === false)?.label?.length ||
          1,
      )}
      disabled={props.disabled}
    />
  );
});
