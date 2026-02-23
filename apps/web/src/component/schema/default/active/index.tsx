import { Form, Tag } from "@douyinfe/semi-ui";

import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { optionsUtils } from "../../util";

import "../fast/fast.less";
import { FastRadio } from "../fast/radio/render";

const defaultOptions = [
  {
    label: <Tag color="green">正常</Tag>,
    value: true,
  },
  {
    label: <Tag color="red">禁用</Tag>,
    value: false,
  },
];

type ActiveProps = {
  options: Array<{
    label: string;
    value: number | string | boolean;
  }>;
  permission: string;
  onSubmit: (editValue: any, record: any) => Promise<void>;
};

export const active = {
  render: (props: any) => (
    <FastRadio {...props} options={props?.options || defaultOptions} />
  ),
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

export type ActiveColumn = SchemaColumnBase<"active", ActiveProps>;
