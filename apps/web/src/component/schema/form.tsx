import { Button, Form, Modal, Space, Spin } from "@douyinfe/semi-ui";
import { ButtonProps } from "@douyinfe/semi-ui/lib/es/button/Button";
import { BaseFormProps, FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { ModalReactProps } from "@douyinfe/semi-ui/lib/es/modal";
import { useRequest } from "ahooks";
import React, { useRef, useState } from "react";

import { SchemaContext } from "./context/schema-content";
import { SchemaFields } from "./fields";
import { SchemaColumn, SchemaScene } from "./typing";
import { set } from "lodash-es";

export type SchemaFormProps = {
  columns: Array<SchemaColumn>;
  layout?: "modal";
  loading?: boolean;
  initValues?: BaseFormProps["initValues"];
  getFormApi?: BaseFormProps["getFormApi"];
  onSubmit?: (
    values: any,
    e?: React.FormEvent<HTMLFormElement>
  ) => (void | boolean) | Promise<void | boolean>;
  onReset?: BaseFormProps["onReset"];
  onSuccess?: () => void;
  formProps?: BaseFormProps;
  modalProps?: ModalReactProps;
  submitButtonProps?: React.PropsWithChildren<ButtonProps> | false;
  resetButtonProps?: React.PropsWithChildren<ButtonProps> | false;
  scene?: SchemaScene;
  beforeSubmit?: (value: any) => any;
  renderExtraButton?: () => React.ReactNode;
};

const findParentNode = (i: any, cb: any): any => {
  const r = cb(i?.parentNode);
  if (r !== false) {
    return i.parentNode;
  }
  return findParentNode(i.parentNode, cb);
};

const SchemaFormBase = ({
  getFormApi,
  onSubmit,
  onReset,
  initValues,
  formProps,
  columns,
  loading,
  submitButtonProps,
  resetButtonProps,
  scene = "form",
  renderExtraButton,
}: SchemaFormProps) => {
  const [currentChangedValue, setCurrentChangedValue] = useState({});
  const formRef = useRef<any>();
  const formApi = useRef<FormApi>();
  const [valueVersion, setValueVersion] = useState(0);

  const defaultSubmitButtonProps = {
    theme: "solid",
    children: "提交",
    loading,
  } as ButtonProps;

  const defaultResetButtonProps = {
    children: "重置",
  } as ButtonProps;

  return (
    <SchemaContext.Provider
      value={{
        scene,
        changedValue: currentChangedValue,
        valueVersion,
      }}
    >
      <Spin spinning={loading}>
        <Form
          ref={formRef}
          {...formProps}
          allowEmpty={formProps?.allowEmpty ?? true}
          autoScrollToError={formProps?.autoScrollToError ?? true}
          initValues={initValues}
          onSubmit={onSubmit}
          onReset={() => {
            onReset?.();
            setValueVersion((r) => r + 1);
          }}
          getFormApi={(f: FormApi) => {
            formApi.current = f;
            getFormApi?.(f);
          }}
          onValueChange={(values, changedValue) => {
            setCurrentChangedValue(
              Object.keys(changedValue).reduce((p, k) => {
                return set(p, k, changedValue[k]);
              }, {})
            );
            formProps?.onValueChange?.(values, changedValue);
          }}
          onSubmitFail={() => {
            if (
              !formRef.current?.state?.formId ||
              formProps?.autoScrollToError === false
            ) {
              return;
            }

            /** 以下是TAB自动定位错误逻辑 */
            const tabs = document.querySelector(
              `[x-form-id="${formRef.current?.state?.formId}"] ._form_tabs`
            );

            if (!tabs) return;

            const tableFieldDom = findParentNode(tabs, (i: any) => {
              if (i?.className === "semi-form-field") {
                return i;
              }
              return false;
            });

            if (!tableFieldDom) return;

            const tabFiled = tableFieldDom.getAttribute("x-field-id");
            if (!tabFiled) return;

            const errMsgDom = document.querySelector(
              `[x-form-id="${formRef.current?.state?.formId}"] .semi-form-field-error-message`
            );

            if (errMsgDom) {
              const panel = findParentNode(errMsgDom, (i: any) => {
                if (i?.tagName === "FORM") {
                  return undefined;
                }

                if (i?.role === "tabpanel") {
                  return i;
                }

                return false;
              });

              if (panel && panel.id && panel.id.startsWith("semiTabPanel")) {
                const tab = panel.id.replace("semiTabPanel", "");
                formApi.current?.setValue(tabFiled, tab);
                const errFiledName = errMsgDom
                  ?.querySelectorAll?.("[id]")?.[0]
                  ?.id?.replace?.("-errormessage", "");
                if (errFiledName) {
                  setTimeout(() => {
                    formApi.current?.scrollToField(errFiledName);
                  }, 500);
                }
              }
            }
          }}
        >
          <SchemaFields columns={columns} />
          {renderExtraButton ||
          submitButtonProps !== false ||
          resetButtonProps !== false ? (
            <div style={{ paddingLeft: 14 }}>
              <Space>
                {renderExtraButton?.()}
                {submitButtonProps !== false ? (
                  <Button
                    {...defaultSubmitButtonProps}
                    {...submitButtonProps}
                    onClick={() => {
                      formApi.current?.submitForm();
                    }}
                  />
                ) : null}
                {resetButtonProps !== false ? (
                  <Button
                    {...defaultResetButtonProps}
                    {...resetButtonProps}
                    onClick={() => {
                      formApi.current?.reset();
                    }}
                  />
                ) : null}
              </Space>
            </div>
          ) : null}
        </Form>
      </Spin>
    </SchemaContext.Provider>
  );
};

const SchemaFromModal = ({
  onSubmit,
  getFormApi,
  modalProps = {},
  loading,
  ...props
}: SchemaFormProps) => {
  const formApi = useRef<FormApi>();

  return (
    <Modal
      {...modalProps}
      closeOnEsc={modalProps.closeOnEsc || false}
      confirmLoading={loading}
      onOk={(e: any) => {
        if (modalProps?.onOk) {
          modalProps.onOk(e);
        } else {
          formApi.current?.submitForm();
        }
      }}
      className={`${modalProps?.fullScreen ? "" : "form-modal"} ${
        modalProps.className || ""
      }`}
      bodyStyle={{
        ...(modalProps?.bodyStyle || {}),
        paddingRight: 4,
      }}
    >
      <SchemaFormBase
        {...props}
        getFormApi={(f) => {
          formApi.current = f;
          getFormApi?.(f);
        }}
        loading={loading}
        submitButtonProps={false}
        resetButtonProps={false}
        onSubmit={async (value) => {
          const isClose = await onSubmit?.(value);
          if (isClose !== false) modalProps?.onCancel?.(null as any);
        }}
      />
    </Modal>
  );
};

const SchemaFormLayout = {
  modal: SchemaFromModal,
};

export const SchemaForm = ({
  layout,
  onSubmit,
  beforeSubmit = (v) => v,
  onSuccess,
  ...props
}: SchemaFormProps) => {
  const { loading, runAsync } = useRequest(
    async (value) => await onSubmit?.(beforeSubmit(value)),
    {
      manual: true,
      onSuccess,
    }
  );

  const Form = (layout && SchemaFormLayout[layout]) || SchemaFormBase;
  return <Form {...props} loading={loading} onSubmit={runAsync} />;
};
