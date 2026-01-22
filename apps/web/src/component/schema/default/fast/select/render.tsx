import { IconClose, IconEdit2Stroked, IconTick } from "@douyinfe/semi-icons";
import { Button, Select, Space, Spin } from "@douyinfe/semi-ui";
import { useEffect, useMemo, useState } from "react";

import { Access } from "../../../../auth/access";
import { optionsUtils } from "../../../util";
import { status } from "../../status";

import "../fast.less";

const defaultOptions: any[] = [];

export const FastSelect = (props: any) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<any>(props.value);
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
    return status.render(props);
  }, [props]);

  return editing ? (
    <Spin spinning={loading}>
      <Space>
        <Select
          value={editValue}
          onChange={(v) => {
            setEditValue(v);
          }}
          size="small"
          style={{ minWidth: 80 }}
          optionList={optionsUtils.transfrom(
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
