import { IconDelete, IconHelpCircle, IconPlus } from "@douyinfe/semi-icons";
import { Button, Space, Tooltip } from "@douyinfe/semi-ui";
import {
  Form,
  ArrayField as SemiArrayField,
  useFormApi,
  useFormState,
} from "@douyinfe/semi-ui";
import { ArrayFieldChildrenProps } from "@douyinfe/semi-ui/lib/es/form/arrayField";
import { chunk, cloneDeep, get, omit, range, set } from "lodash-es";
import React, { useMemo, useState } from "react";
import { SchemaTableColumn } from "../../render/schema-table-colunm";
import { SchemaFormFiled } from "../../render/schema-form-field";
import { SchemaColumn, SchemaFormState } from "../../typing";
import { ArrayFieldTable } from "./style";
import { SchemaForm } from "../../form";

type ArrayProps = {
  plusButtonText?: React.ReactNode;
  createInitValue?: any;
  renderAddonButton?: (ac: any) => React.ReactNode;
  columns: SchemaColumn[];
};

export type ArrayFieldProps = ArrayProps & {
  columns: Array<SchemaColumn>;
  label?: any;
  labelPosition?: "top" | "left" | "inset";
  addable?: boolean;
  deleteable?: boolean;
  renderAction?: any;
  actionWidth?: number;
  lineCount?: number;
  renderChildren?: (i: any) => React.ReactNode;
  extraText?: any;
  noLabel?: boolean;
  field?: string;
  minCount?: number;
  maxCount?: number;
  beforeAdd?: (item: any) => Promise<any>;
  modalWidth?: number;
  editText?: string;
};

export const ArrayField = ({
  columns,
  plusButtonText = "添加一行",
  label,
  createInitValue,
  addable = true,
  deleteable = true,
  renderAddonButton,
  actionWidth = 80,
  renderAction,
  lineCount = 1,
  renderChildren,
  minCount,
  maxCount,
  beforeAdd,
  modalWidth,
  editText = "编辑",
  ...props
}: ArrayFieldProps) => {
  const formApi = useFormApi();
  const semiFormState = useFormState();
  const [editState, setEditState] = useState<{
    visible: boolean;
    field: string;
    initValues: any;
  }>({
    visible: false,
    field: "",
    initValues: {},
  });

  const tempState: SchemaFormState = {
    values: semiFormState.values,
    scene: "table",
    field: props.field || "",
  };

  const header = useMemo(() => {
    return columns?.map((col, index) => {
      const type =
        typeof col.type === "function" ? col.type(tempState) : col.type;

      const title =
        typeof col.title === "function" ? col.title(tempState) : col.title;

      const helper = col.helper;
      const extra = col.extra;

      const required =
        typeof col.required === "function"
          ? col.required(tempState)
          : col.required;

      if (col?.hiddenInTable === true) return null;

      return (
        <th
          className="semi-table-row-head"
          style={{
            width: col.width,
            display: type === "hidden" ? "none" : "table-cell",
          }}
          key={`${col.dataIndex || "null"}_${index}`}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: (
                {
                  left: "flex-start",
                  center: "center",
                  right: "flex-end",
                } as any
              )[col.align || "left"],
              width: "100%",
            }}
          >
            <span>{title}</span>
            {required ? <span className="semi-table-required">*</span> : null}
            {helper ? (
              <Tooltip content={helper}>
                <IconHelpCircle className="semi-table-helper" />
              </Tooltip>
            ) : null}
            {extra ? <div className="semi-table-extra">{extra}</div> : null}
          </div>
        </th>
      );
    });
  }, [columns, tempState]);

  const defaultChildren = (action: ArrayFieldChildrenProps) => {
    const { arrayFields } = action;

    const addWithInitValue = async (_initValue: any) => {
      if (beforeAdd) {
        action.addWithInitValue(await beforeAdd(_initValue));
      } else {
        action.addWithInitValue(_initValue);
      }
    };
    const arrayFiledsDom = (
      <ArrayFieldTable>
        <div className="semi-table-bordered semi-table-small semi-table-scroll-position-left">
          <div className="semi-table-container">
            <div className="semi-table-body">
              <table className="semi-table">
                <thead className="semi-table-thead">
                  <tr className="semi-table-row">
                    {range(lineCount).map((i) => (
                      <React.Fragment key={i}>
                        {header}
                        <th
                          className="semi-table-row-head semi-table-align-center"
                          style={{ width: actionWidth }}
                        >
                          操作
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="semi-table-tbody">
                  {chunk(arrayFields, lineCount).map((arrayFieldItems: any) => {
                    return (
                      <tr
                        className="semi-table-row"
                        key={arrayFieldItems?.[0]?.key}
                      >
                        {arrayFieldItems.map((arrayFieldItem: any) => {
                          // if (!arrayFieldItem) return;
                          let delDisabled = false;
                          if (
                            typeof minCount === "number" &&
                            arrayFields.length <= minCount
                          ) {
                            delDisabled = true;
                          }
                          return (
                            <React.Fragment key={arrayFieldItem.key}>
                              {columns?.map((col, index) => {
                                const type =
                                  typeof col.type === "function"
                                    ? col.type(tempState)
                                    : col.type;

                                const colProps =
                                  typeof col.props === "function"
                                    ? col.props(tempState)
                                    : col.props;

                                if (col.hiddenInTable) return null;
                                if (colProps?.complexEasy === true) {
                                  return (
                                    <td
                                      className="semi-table-row-cell"
                                      key={`${col.dataIndex || "null"}_${index}`}
                                      style={{
                                        display:
                                          type === "hidden"
                                            ? "none"
                                            : "table-cell",
                                        textAlign: col.align || "left",
                                      }}
                                    >
                                      <SchemaFormFiled
                                        column={col}
                                        field={arrayFieldItem.field}
                                        arrayContext={{}}
                                      />
                                    </td>
                                  );
                                }

                                const record = get(
                                  semiFormState.values,
                                  arrayFieldItem.field,
                                  {}
                                );

                                const text = get(
                                  record,
                                  col.dataIndex || "",
                                  "-"
                                );

                                return (
                                  <td
                                    className="semi-table-row-cell"
                                    key={`${col.dataIndex || "null"}_${index}`}
                                    style={{
                                      display: "table-cell",
                                      textAlign: col.align || "left",
                                    }}
                                  >
                                    <SchemaTableColumn
                                      value={text}
                                      record={record}
                                      index={index}
                                      column={col}
                                    />
                                  </td>
                                );
                              })}
                              <td
                                className="semi-table-row-cell"
                                style={{ textAlign: "center" }}
                              >
                                <Button
                                  size="small"
                                  theme="borderless"
                                  onClick={() => {
                                    const initValues = formApi.getValue(
                                      arrayFieldItem.field
                                    );
                                    setEditState({
                                      visible: true,
                                      field: arrayFieldItem.field,
                                      initValues,
                                    });
                                  }}
                                >
                                  {editText}
                                </Button>
                                {renderAction?.(arrayFieldItem)}
                                {deleteable ? (
                                  <Button
                                    icon={<IconDelete size="small" />}
                                    size="small"
                                    theme="borderless"
                                    type="danger"
                                    disabled={delDisabled}
                                    onClick={() => arrayFieldItem?.remove()}
                                  />
                                ) : null}
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ArrayFieldTable>
    );

    return (
      <>
        <Form.Slot
          label={label}
          labelPosition={props.labelPosition as any}
          noLabel={!label || props.noLabel}
        >
          {arrayFields?.length > 0 ? (
            <>
              {arrayFiledsDom}
              <br />
            </>
          ) : null}
          <Space>
            {addable ? (
              <Button
                icon={<IconPlus />}
                onClick={() => {
                  addWithInitValue(createInitValue ?? {});
                }}
                disabled={
                  typeof maxCount === "number"
                    ? arrayFields?.length >= maxCount
                    : false
                }
              >
                {plusButtonText}
              </Button>
            ) : null}
            {renderAddonButton?.({
              ...action,
              addWithInitValue,
            })}
          </Space>

          {props?.extraText ? (
            <div className="semi-form-field-extra semi-form-field-extra-bottom">
              {props?.extraText}
            </div>
          ) : null}
        </Form.Slot>
      </>
    );
  };

  return (
    <>
      <SchemaForm
        columns={columns.map((i) => ({ ...i, width: "100%" }))}
        onSubmit={(newValues) => {
          const values = cloneDeep(formApi.getValues());
          set(values, editState.field, newValues);
          formApi.setValues(values, {
            isOverride: true,
          });
          setEditState({ visible: false, field: "", initValues: {} });
        }}
        layout="modal"
        initValues={editState.initValues}
        modalProps={{
          visible: editState.visible,
          title: "编辑",
          width: modalWidth ?? 900,
          onCancel: () => {
            setEditState({ visible: false, field: "", initValues: {} });
          },
          centered: true,
        }}
      />
      <SemiArrayField {...omit(props, "initValue")}>
        {renderChildren || defaultChildren}
      </SemiArrayField>
    </>
  );
};
