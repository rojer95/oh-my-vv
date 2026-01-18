import { InputNumberProps } from "@douyinfe/semi-ui/lib/es/inputNumber";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { InputNumberField } from "../number/field";

export const money = {
  render: (props) => Number(props.value || 0).toFixed(2),
  renderForm: ({ min = 0, ...props }) => (
    <InputNumberField {...props} precision={2} min={min} />
  ),
} as SchemaDefined;

export type MoneyColumn = SchemaColumnBase<"money", InputNumberProps>;
