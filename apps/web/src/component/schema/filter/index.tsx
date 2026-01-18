import { Button, Space } from "@douyinfe/semi-ui";
import { BaseFormProps, FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { ColProps, RowProps } from "@douyinfe/semi-ui/lib/es/grid";
import { useRef } from "react";

import { SchemaForm } from "../form";
import { SchemaColumn } from "../typing";
import { filterUtils } from "../util";

import { useGlobalSchema } from "../hook/use-global-schema";
import "./index.less";

interface SchemaFilterProps {
  columns: Array<SchemaColumn>;
  onSubmit: BaseFormProps["onSubmit"];
  onReset: BaseFormProps["onReset"];
  getFormApi?: BaseFormProps["getFormApi"];
  beforeFilter?: (value: any) => any;
  initValues?: BaseFormProps["initValues"];
  filterLayout?: {
    rowProps?: RowProps;
    colProps?: ColProps;
  };
}

const SchemaFilter = function ({
  columns,
  onSubmit,
  onReset,
  filterLayout = {
    rowProps: {
      gutter: 8,
    },
    colProps: {
      span: 24,
      lg: 12,
      xl: 8,
      xxl: 6,
    },
  },
  beforeFilter = (v) => v,
  getFormApi,
  initValues,
}: SchemaFilterProps) {
  const formApi = useRef<FormApi>(null);
  const schemas = useGlobalSchema();

  return (
    <div className="filter-form">
      <SchemaForm
        onSubmit={(value) =>
          onSubmit?.(filterUtils.value2Filter(value, columns, schemas || {}))
        }
        initValues={initValues}
        onReset={onReset}
        beforeSubmit={beforeFilter}
        getFormApi={(f) => {
          formApi.current = f;
          getFormApi?.(f);
        }}
        columns={[
          {
            type: "group",
            props: {
              ...filterLayout.rowProps,
              ...filterLayout.colProps,
            },
            columns,
          },
          {
            type: "group",
            props: {
              type: "flex",
              justify: "end",
            },
            columns: [
              {
                formFieldRender: () => (
                  <Space>
                    <Button
                      onClick={() => {
                        formApi.current?.reset();
                      }}
                    >
                      重置
                    </Button>
                    <Button
                      onClick={() => {
                        formApi.current?.submitForm();
                      }}
                      theme="solid"
                    >
                      搜索
                    </Button>
                  </Space>
                ),
              },
            ],
          },
        ]}
        formProps={{
          labelPosition: "left",
          labelAlign: "right",
          autoScrollToError: false,
          allowEmpty: false,
        }}
        submitButtonProps={false}
        resetButtonProps={false}
        scene="filter"
      />
    </div>
  );
};

export { SchemaFilter };
