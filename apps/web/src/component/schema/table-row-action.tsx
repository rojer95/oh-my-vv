import {
  Button,
  Popconfirm,
  Spin,
  Tooltip,
  Typography,
} from "@douyinfe/semi-ui";
import { useRequest } from "ahooks";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { Access } from "../auth/access";
import { SchemaForm } from "./form";
import { TableRowActionProps } from "./typing";

export const A = styled(Typography.Text)`
  cursor: pointer;
  color: var(--semi-color-link);
`;

export const TableRowAction = ({
  popconfirmProps,
  requestInput,
  onClick,
  text,
  icon,
  disabled = false,
  type = "primary",
  theme = "a",
  permission,
  more = false,
  tooltip = undefined,
}: TableRowActionProps) => {
  const [requestInputVisible, setRequestInputVisible] = useState(false);

  const { loading, runAsync } = useRequest<void, any>(
    async (value) => {
      await onClick?.(value);
    },
    {
      manual: true,
    }
  );

  const InputModal = requestInput ? (
    <SchemaForm
      layout="modal"
      modalProps={{
        visible: requestInputVisible,
        title: requestInput.title,
        onCancel: () => setRequestInputVisible(false),
      }}
      initValues={requestInput.initValue || {}}
      onSubmit={async (value) => {
        if (disabled) return;
        await runAsync?.(value);
      }}
      columns={requestInput.columns}
    />
  ) : null;

  const textOnClick = () => {
    if (disabled || more || popconfirmProps) return;
    if (requestInput) {
      setRequestInputVisible(true);
    } else {
      runAsync();
    }
  };

  const Text = useMemo(() => {
    const Btn =
      theme === "a" ? (
        <span>
          <Spin spinning={loading}>
            <A type={type} disabled={disabled} onClick={textOnClick}>
              {text}
            </A>
          </Spin>
        </span>
      ) : (
        <Button
          theme={theme}
          type={type}
          loading={loading}
          icon={icon}
          disabled={disabled}
          onClick={textOnClick}
          size="small"
        >
          {text}
        </Button>
      );
    if (tooltip) {
      return <Tooltip content={tooltip}>{Btn}</Tooltip>;
    }
    return Btn;
  }, [text, icon, theme, type, disabled, textOnClick, tooltip]);

  if (!popconfirmProps || more === true) {
    return (
      <Access permission={permission}>
        {Text}
        {InputModal}
      </Access>
    );
  }

  return (
    <Access permission={permission}>
      <Popconfirm
        {...popconfirmProps}
        title={popconfirmProps?.title ?? "操作确认"}
        onConfirm={() => {
          if (disabled) return;
          if (requestInput) {
            setRequestInputVisible(true);
            return;
          }
          runAsync();
        }}
        disabled={disabled}
      >
        {Text}
      </Popconfirm>
      {InputModal}
    </Access>
  );
};
