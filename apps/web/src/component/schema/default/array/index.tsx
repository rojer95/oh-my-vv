import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { ArrayField, ArrayFieldProps } from "./filed";

export const array = {
  render: () => null,
  renderForm: (props: any) => {
    return <ArrayField {...props} columns={props.columns} />;
  },
} as SchemaDefined;

export type ArrayColunm = SchemaColumnBase<"array", ArrayFieldProps>;
