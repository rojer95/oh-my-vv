import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { ArrayField, ArrayFieldProps } from "./filed";

export const complexArray = {
  render: () => null,
  renderForm: (props: any) => {
    return <ArrayField {...props} columns={props.columns} />;
  },
} as SchemaDefined;

export type ArrayColunm = SchemaColumnBase<"complex-array", ArrayFieldProps>;
