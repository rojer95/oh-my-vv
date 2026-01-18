import { Form } from "@douyinfe/semi-ui";
import { TextAreaProps } from "@douyinfe/semi-ui/lib/es/input";
import { SchemaColumnBase, SchemaDefined } from "../../typing";

export const textarea = {
  render: (props) => props.value,
  renderForm: (props) => <Form.TextArea {...props} />,
} as SchemaDefined;

export type TextareaColumn = SchemaColumnBase<"textarea", TextAreaProps>;
