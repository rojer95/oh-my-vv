import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { TabsField, TabsProps } from "./field";

export const tabs = {
  render: () => null,
  renderForm: (props, column) => (
    <TabsField tabField={column.dataIndex || ""} {...props} noLabel />
  ),
} as SchemaDefined;

export type TabsColumn = SchemaColumnBase<"tabs", TabsProps>;
