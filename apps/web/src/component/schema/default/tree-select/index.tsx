import { Form, TreeSelect } from "@douyinfe/semi-ui";
import { TreeSelectProps } from "@douyinfe/semi-ui/lib/es/treeSelect";
import { SchemaColumnBase, SchemaDefined } from "../../typing";

export const treeSelect = {
  render: (props) => <TreeSelect {...props} />,
  renderForm: (props) => <Form.TreeSelect {...props} />,
} as SchemaDefined;

export type TreeSelectColumn = SchemaColumnBase<"tree-select", TreeSelectProps>;
