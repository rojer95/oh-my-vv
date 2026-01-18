import { Form } from "@douyinfe/semi-ui";
import { InputProps } from "@douyinfe/semi-ui/lib/es/input";
import { SchemaColumnBase, SchemaDefined } from "../../typing";

export const tel = {
  render: ({ value }) => {
    return value;
  },
  renderForm: (props) => (
    <Form.Input
      {...props}
      rules={[
        ...(props.rules || []),
        {
          pattern: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/,
          message: "号码不正确",
        },
      ]}
    />
  ),
} as SchemaDefined;

export type TelColumn = SchemaColumnBase<"tel", InputProps>;
