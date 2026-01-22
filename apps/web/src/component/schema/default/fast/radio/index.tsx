import { Form } from "@douyinfe/semi-ui";

import { SchemaColumnBase, SchemaDefined } from "../../../typing";
import { optionsUtils } from "../../../util";

import { FastRadio } from "./render";

import "../fast.less";

const defaultOptions = [
  {
    label: "是",
    value: true,
  },
  {
    label: "否",
    value: false,
  },
];

type FastRadioProps = {
  options: Array<{
    label: string;
    value: number | string | boolean;
  }>;
  permission: string;
  onSubmit: (editValue: any, record: any) => Promise<void>;
};

export const fastRadio = {
  render: (props: any) => <FastRadio {...props} />,
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

export type FastRadioColumn = SchemaColumnBase<"fast-radio", FastRadioProps>;
