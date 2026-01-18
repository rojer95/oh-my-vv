import { InputNumberProps } from "@douyinfe/semi-ui/lib/es/inputNumber";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { InputNumberField } from "../number/field";

export const id = {
  render: (props) => props.value,
  renderForm: (props) => {
    return <InputNumberField {...props} precision={0} min={1} hideButtons />;
  },
} as SchemaDefined;

export type IdColumn = SchemaColumnBase<
  "id",
  Omit<InputNumberProps, "precision" | "min" | "hideButtons">
>;
