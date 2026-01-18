import { TreeSelect } from "@douyinfe/semi-ui";
import { TreeSelectProps } from "@douyinfe/semi-ui/lib/es/treeSelect";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { TreeField } from "./field";

export const tree = {
  render: (props) => <TreeSelect {...props} />,
  renderForm: (props) => <TreeField {...props} />,
} as SchemaDefined;

export type TreeColumn = SchemaColumnBase<"tree", TreeSelectProps>;
