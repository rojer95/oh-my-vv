import { Modal } from "@douyinfe/semi-ui";
import { GetCheckboxProps } from "@douyinfe/semi-ui/lib/es/table";
import { pull } from "lodash-es";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { SchemaTable } from "../../table";
import { SchemaColumn } from "../../typing";

export type RemotePickerModalRef = {
  open: (initValue?: any) => Promise<{ success: boolean; data?: any }>;
};

export type RemotePickerModalProps = {
  title?: string;
  defaultPageSize?: number;
  rowKey?: string;
  pickerListApi: (options: any) => Promise<[any[], number]>;
  columns?: SchemaColumn[];
  multiple?: boolean;
  childrenRecordName?: string;
  getCheckboxProps?: GetCheckboxProps<any>;
};
export const RemotePickerModal = forwardRef<
  RemotePickerModalRef,
  RemotePickerModalProps
>(
  (
    {
      pickerListApi,
      title,
      columns = [],
      defaultPageSize = 10,
      rowKey = "id",
      multiple = true,
      childrenRecordName,
      getCheckboxProps,
    },
    ref
  ) => {
    const callback = useRef<any>(undefined);
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => {
      return {
        open: (initValue: any = []) => {
          return new Promise((resolve) => {
            callback.current = resolve;
            setVisible(true);
            setTempValue(initValue);
          });
        },
      };
    }, []);

    const [tempValue, setTempValue] = useState<any[]>([]);

    return (
      <Modal
        title={title}
        visible={visible}
        keepDOM={false}
        width={1200}
        bodyStyle={{ height: "75vh", overflowY: "auto" }}
        onCancel={() => {
          setVisible?.(false);
          setTempValue([]);
          callback.current?.({
            success: false,
            data: [],
          });
        }}
        onOk={() => {
          setVisible?.(false);
          setTempValue([]);
          callback.current?.({
            success: true,
            data: tempValue || [],
          });
          callback.current = undefined;
        }}
        centered
      >
        <SchemaTable
          size="small"
          defaultPageSize={defaultPageSize}
          request={pickerListApi}
          columns={columns}
          rowKey={rowKey}
          childrenRecordName={childrenRecordName}
          onRow={(record) => {
            return {
              style: { cursor: "pointer" },
              onClick: () => {
                if (multiple) {
                  setTempValue((pretemp) => {
                    if (pretemp.includes(record[rowKey])) {
                      return pull([...pretemp], record[rowKey]);
                    } else {
                      return [...pretemp, record[rowKey]];
                    }
                  });
                } else {
                  setTempValue((pretemp) => {
                    if (pretemp.includes(record[rowKey])) {
                      return [];
                    } else {
                      return [record[rowKey]];
                    }
                  });
                }
              },
            };
          }}
          rowSelection={{
            getCheckboxProps,
            width: 30,
            selectedRowKeys: tempValue,
            onChange: (selectedRowKeys) => {
              if (multiple) {
                setTempValue(selectedRowKeys || []);
              }
            },
            onSelect: (record, selected) => {
              if (!multiple) {
                setTempValue(selected ? [record[rowKey]] : []);
              }
            },
          }}
          hideActionBar
        />
      </Modal>
    );
  }
);
