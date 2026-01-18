import { SchemaColumnBase, SchemaDefined } from "../../typing";

export const display = {
  render: (props) => {
    return props?.displayValue || props.value;
  },
  renderForm: (props) => {
    return props?.displayValue || props.value;
  },
} as SchemaDefined;

export type DisplayColumn = SchemaColumnBase<"display">;
