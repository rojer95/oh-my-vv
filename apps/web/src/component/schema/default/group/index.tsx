import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { GroupFiled, GroupProps } from "./field";

export const group = {
  render: () => null,
  renderForm: (props: any) => {
    return <GroupFiled {...props} />;
  },
} as SchemaDefined;

export type GroupColumn = SchemaColumnBase<"group", GroupProps>;
