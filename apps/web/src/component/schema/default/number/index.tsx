import { InputNumberProps } from "@douyinfe/semi-ui/lib/es/inputNumber";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { InputNumberField } from "./field";

export const number = {
  render: (props) => props.value,
  renderForm: (props) => <InputNumberField {...props} />,
} as SchemaDefined;

export type NumberColumn = SchemaColumnBase<"number", InputNumberProps>;
