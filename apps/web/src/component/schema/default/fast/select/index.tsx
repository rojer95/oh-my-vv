import { Form } from "@douyinfe/semi-ui";

import { SchemaColumnBase, SchemaDefined } from "../../../typing";
import { optionsUtils } from "../../../util";

import { FastSelect } from "./render";

import "../fast.less";

const defaultOptions: any[] = [];

type FastSelectProps = {
  options: Array<{
    label: string;
    value: number | string | boolean;
  }>;
  permission: string;
  onSubmit: (editValue: any, record: any) => Promise<void>;
};

export const fastSelect = {
  render: (props: any) => <FastSelect {...props} />,
  renderForm: (props: any) => {
    return (
      <Form.RadioGroup
        {...props}
        options={optionsUtils.transfrom(
          props.options ?? defaultOptions,
          props?.valueKey,
          props?.labelKey,
        )}
      />
    );
  },
} as SchemaDefined;

export type FastSelectColumn = SchemaColumnBase<"fast-select", FastSelectProps>;
