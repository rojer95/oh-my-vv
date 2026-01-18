import { Form } from "@douyinfe/semi-ui";

import { SchemaColumnBase, SchemaDefined } from "../../../typing";
import { optionsUtils } from "../../../util";

import { FastSwitch } from "./render";

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

type FastSwitchProps = {
  options: Array<{
    label: string;
    value: number | string | boolean;
  }>;
  permission: string;
  onSubmit: (editValue: any, record: any) => Promise<void>;
};

export const fastSwitch = {
  render: (props: any) => <FastSwitch {...props} />,
  renderForm: (props: any) => {
    return (
      <Form.RadioGroup
        {...props}
        options={optionsUtils.transfrom(props.options ?? defaultOptions)}
      />
    );
  },
} as SchemaDefined;

export type FastSwitchColumn = SchemaColumnBase<"fast-switch", FastSwitchProps>;
