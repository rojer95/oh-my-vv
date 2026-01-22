import { Form } from "@douyinfe/semi-ui";
import { CheckboxGroupProps } from "@douyinfe/semi-ui/lib/es/checkbox";
import { optionsUtils } from "../../util";
import { SchemaColumnBase, SchemaDefined } from "../../typing";

export const checkboxGroup = {
  render: (props) =>
    optionsUtils.getLabelStringByValue(
      props.options,
      props.value,
      props?.valueKey,
      props?.labelKey,
    ),
  renderForm: (props) => (
    <Form.CheckboxGroup
      {...props}
      options={optionsUtils.transfrom(
        props.options,
        props?.valueKey,
        props?.labelKey,
      )}
    />
  ),
} as SchemaDefined;

export type CheckboxGroupColumn = SchemaColumnBase<
  "checkbox-group",
  CheckboxGroupProps
>;
