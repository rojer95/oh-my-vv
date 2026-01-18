import { Form } from "@douyinfe/semi-ui";
import { CascaderProps } from "@douyinfe/semi-ui/lib/es/cascader";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { CascaderRender } from "./render";

export const cascader = {
  render: (props) => {
    return <CascaderRender {...props} />;
  },
  renderForm: (props) => <Form.Cascader {...props} />,
} as SchemaDefined;

export type CascaderColunm = SchemaColumnBase<"cascader", CascaderProps>;
