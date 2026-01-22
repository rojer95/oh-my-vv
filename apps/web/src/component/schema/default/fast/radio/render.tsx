import { IconClose, IconEdit2Stroked, IconTick } from "@douyinfe/semi-icons";
import { Button, RadioGroup, Space, Spin } from "@douyinfe/semi-ui";
import { useEffect, useMemo, useState } from "react";

import { Access } from "../../../../auth/access";
import { optionsUtils } from "../../../util";
import { status } from "../../status";

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

export const FastRadio = (props: any) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<number | string>(props.value);
  const [loading, setLoading] = useState<boolean>(false);

  const reset = () => {
    setEditing(false);
    setEditValue(props.value);
  };

  const submit = async () => {
    setLoading(true);
    try {
      await props?.onSubmit?.(editValue, props.record);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reset();
  }, [props?.record]);

  const dom = useMemo(() => {
    return status.render({
      ...props,
      options: props.options ?? defaultOptions,
    });
  }, [props]);

  return editing ? (
    <Spin spinning={loading}>
      <Space>
        <RadioGroup
          buttonSize="small"
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
          }}
          options={optionsUtils.transfrom(
            props.options ?? defaultOptions,
            props?.valueKey,
            props?.labelKey,
          )}
        />
        <Button
          onClick={submit}
          theme="borderless"
          size="small"
          icon={<IconTick size="small" />}
        />
        <Button
          onClick={reset}
          theme="borderless"
          size="small"
          icon={<IconClose size="small" />}
        />
      </Space>
    </Spin>
  ) : (
    <Access permission={props.permission} feedback={dom}>
      <span
        className="fast-cell"
        onClick={() => {
          setEditValue(props.value);
          setEditing(true);
        }}
      >
        {dom}
        <IconEdit2Stroked size="small" />
      </span>
    </Access>
  );
};
