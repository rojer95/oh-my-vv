import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { LngLatPickerFiled, PositionProps } from "./field";

export const position = {
  render: (props) => props.value,
  renderForm: (props) => <LngLatPickerFiled {...props} />,
} as SchemaDefined;

export type PositionColumn = SchemaColumnBase<"position", PositionProps>;
