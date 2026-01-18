import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { InputGroup, MyInputGroupProps } from "./field";

export const inputGroup = {
  render: () => null,
  renderForm: ({ ...props }) => {
    return <InputGroup {...props} />;
  },
} as SchemaDefined;

export type InputGroupColumn = SchemaColumnBase<
  "input-group",
  MyInputGroupProps
>;
