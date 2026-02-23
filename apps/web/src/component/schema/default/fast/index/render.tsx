import { IconClose, IconEdit2Stroked, IconTick } from "@douyinfe/semi-icons";
import { Button, InputNumber, Space, Spin } from "@douyinfe/semi-ui";
import { useEffect, useState } from "react";
import { Access } from "../../../../auth/access";

import classNames from "classnames";
import "../fast.less";

export const FastIndex = (props: any) => {
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
    if (editing) reset();
  }, [props?.record]);

  return editing ? (
    <Spin spinning={loading}>
      <Space wrap>
        <InputNumber
          autoFocus
          value={editValue}
          onNumberChange={setEditValue}
          size="small"
          onEnterPress={() => {
            submit();
          }}
          style={{ width: 90 }}
          hideButtons
        />
        <Button
          onClick={() => {
            submit();
          }}
          theme="borderless"
          size="small"
          icon={<IconTick size="small" />}
        />
        <Button
          onClick={() => {
            reset();
          }}
          theme="borderless"
          size="small"
          icon={<IconClose size="small" />}
        />
      </Space>
    </Spin>
  ) : (
    <Access
      permission={props.permission}
      feedback={<span>{props.value ?? "-"}</span>}
    >
      <span
        className={classNames("fast-cell", {
          disabled: props.disabled,
        })}
        onClick={() => {
          if (props.disabled) return;
          setEditValue(props.value);
          setEditing(true);
        }}
      >
        <span>{props.value ?? "-"}</span>
        <IconEdit2Stroked size="small" />
      </span>
    </Access>
  );
};
