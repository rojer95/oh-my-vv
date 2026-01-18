import { Form } from "@douyinfe/semi-ui";
import { BadgeProps } from "@douyinfe/semi-ui/lib/es/badge";
import { RadioGroupProps } from "@douyinfe/semi-ui/lib/es/radio";
import { Options } from "@douyinfe/semi-ui/lib/es/radio/radioGroup";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { optionsUtils } from "../../util";
import { StatusRender } from "./render";

export const status = {
  render: (props) => <StatusRender {...props} />,
  renderForm: (props) => (
    <Form.RadioGroup
      {...props}
      options={optionsUtils.transfrom(props.options)}
    />
  ),
} as SchemaDefined;

export type StatusColumn = SchemaColumnBase<
  "status",
  {
    options?: Array<
      {
        type?: BadgeProps["type"];
        color?: string;
      } & Options
    >;
  } & Omit<RadioGroupProps, "options">
>;
