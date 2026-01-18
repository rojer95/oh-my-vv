import { Button, withField } from "@douyinfe/semi-ui";
import { GetCheckboxProps } from "@douyinfe/semi-ui/lib/es/table";
import { useRequest } from "ahooks";
import { isArray, pull, uniq } from "lodash-es";
import { CSSProperties, useMemo, useRef } from "react";
import { SchemaTable } from "../../table";
import { SchemaColumn } from "../../typing";
import { RemotePickerModal, RemotePickerModalRef } from "./modal";
import { PopconfirmProps } from "@douyinfe/semi-ui/lib/es/popconfirm";

export type RemotePickerProps = {
  value?: any;
  onChange?: (v: any) => void;
  pickerIdsApi: (ids: number[]) => Promise<any[]>;
  pickerListApi: (options: any) => Promise<[any[], number]>;
  rowKey?: string;
  labelKey?: string;
  valueKey?: string;
  style?: CSSProperties;
  placeholder?: string;
  columns?: SchemaColumn[];
  displayColumns?: SchemaColumn[];
  pageSize?: number;
  buttonText?: string;
  textMaxSize?: number;
  multiple?: boolean;
  childrenRecordName?: string;
  getCheckboxProps?: GetCheckboxProps<any>;
  disabled?: boolean;
  deletePopconfirmProps?:
    | Omit<PopconfirmProps, "onConfirm" | "onCancel">
    | false;
  containerType?: "none" | "card";
};

export const RemotePicker = ({
  disabled,
  pickerListApi,
  pickerIdsApi,
  rowKey = "id",
  value,
  onChange,
  pageSize: defaultPageSize = 10,
  columns = [],
  displayColumns = undefined,
  buttonText = "选择",
  multiple = true,
  childrenRecordName,
  getCheckboxProps,
  deletePopconfirmProps,
  containerType = "none",
}: RemotePickerProps) => {
  const ref = useRef<RemotePickerModalRef>(null);

  const ids = useMemo(() => {
    if (isArray(value)) return value;
    if (!multiple && value) return [value];
    return [];
  }, [value, multiple]);

  const { data: selected = [] } = useRequest(
    async () => {
      return await pickerIdsApi(ids);
    },
    {
      refreshDeps: [ids],
    }
  );

  const onOpen = async () => {
    if (!ref.current?.open) return;
    const { success, data } = await ref.current?.open(
      selected?.map((i) => i[rowKey])
    );

    const _ids = uniq(data);
    if (success) {
      if (multiple) {
        onChange?.(_ids);
      } else {
        onChange?.(_ids.length > 0 ? _ids[0] : undefined);
      }
    }
  };

  return (
    <>
      <RemotePickerModal
        pickerListApi={pickerListApi}
        defaultPageSize={defaultPageSize}
        columns={columns}
        title={buttonText}
        rowKey={rowKey}
        ref={ref}
        multiple={multiple}
        childrenRecordName={childrenRecordName}
        getCheckboxProps={getCheckboxProps}
      />

      {selected?.length > 0 ? (
        <>
          <SchemaTable
            dataSource={selected}
            rowKey={rowKey}
            deleteProps={{ disabled }}
            deletePopconfirmProps={deletePopconfirmProps}
            onDelete={(record) => {
              if (multiple) {
                onChange?.(pull([...(value || [])], record[rowKey]));
              } else {
                onChange?.(undefined);
              }
            }}
            columns={[
              ...(displayColumns || columns || []),
              {
                dataIndex: "action",
                title: "操作",
                width: 60,
                type: "action",
                align: "center",
                tableActionRender: (record) => {
                  if (!multiple)
                    return [
                      {
                        key: "edit",
                        record,
                        text: "修改",
                        disabled,
                        onClick: () => {
                          onOpen();
                        },
                      },
                    ];
                  return [];
                },
              },
            ]}
            pagination={false}
            size="small"
            containerType={containerType}
            hideActionBar
            hideFilterBar
          />
        </>
      ) : null}

      {disabled || (multiple === false && selected?.length > 0) ? null : (
        <>
          <br />
          <Button onClick={onOpen}>{buttonText}</Button>
        </>
      )}
    </>
  );
};

export const RemotePickerField = withField(RemotePicker);
