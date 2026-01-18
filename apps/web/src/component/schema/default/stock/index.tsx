import { InputNumberProps } from "@douyinfe/semi-ui/lib/es/inputNumber";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { StockField } from "./filed";

export const stock = {
  render: (props) => Number(props.value || 0).toFixed(2),
  renderForm: (props) => <StockField {...props} />,
} as SchemaDefined;

export type StockColumn = SchemaColumnBase<"stock", InputNumberProps>;
