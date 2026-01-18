import { Form, Typography } from "@douyinfe/semi-ui";
import { InputProps } from "@douyinfe/semi-ui/lib/es/input";
import { Ellipsis } from "@douyinfe/semi-ui/lib/es/typography";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { QuickInput } from "./field";

export const input = {
  render: ({ value, copyable, ellipsis }) => {
    if (copyable || ellipsis) {
      return (
        <Typography.Paragraph
          ellipsis={ellipsis ? ellipsis : false}
          copyable={copyable}
        >
          {value ?? "-"}
        </Typography.Paragraph>
      );
    }

    return value ?? "-";
  },
  renderForm: ({ quick, field, ...props }) => {
    if (Array.isArray(quick) && quick.length > 0) {
      return <QuickInput quick={quick} field={field} {...props} />;
    }
    return <Form.Input field={field} {...props} />;
  },
} as SchemaDefined;

export type InputColumn = SchemaColumnBase<
  "input",
  InputProps & {
    copyable?: boolean;
    ellipsis?: boolean | Ellipsis | undefined;
    quick?: string[];
  }
>;
