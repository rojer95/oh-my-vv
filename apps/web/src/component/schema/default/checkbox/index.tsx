import { Form } from "@douyinfe/semi-ui";
import { CheckboxProps } from "@douyinfe/semi-ui/lib/es/checkbox";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { optionsUtils } from "../../util";

export const checkbox = {
  render: (props) =>
    optionsUtils.getLabelStringByValue(props.options, props.value),
  renderForm: (props) => <Form.Checkbox {...props} />,
} as SchemaDefined;

export type CheckboxColumn = SchemaColumnBase<"checkbox", CheckboxProps>;
