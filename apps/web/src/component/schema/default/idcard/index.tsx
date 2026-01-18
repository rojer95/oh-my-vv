import { Form } from "@douyinfe/semi-ui";
import { InputProps } from "@douyinfe/semi-ui/lib/es/input";
import { SchemaColumnBase, SchemaDefined } from "../../typing";

export const idcard = {
  render: ({ value }) => {
    return value;
  },
  renderForm: (props) => (
    <Form.Input
      {...props}
      rules={[
        ...(props.rules || []),
        {
          pattern:
            /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx]$/,
          message: "身份证号码不正确",
        },
      ]}
    />
  ),
} as SchemaDefined;

export type IdcardColumn = SchemaColumnBase<"idcard", InputProps>;
