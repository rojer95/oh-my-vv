import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { ColorPickerField } from "./field";
import { Rect } from "./style";

export const color = {
  render: (props) => {
    return props?.value ? <Rect color={props.value} /> : "-";
  },
  renderForm: (props) => {
    return <ColorPickerField {...props} />;
  },
} as SchemaDefined;

export type ColorColumn = SchemaColumnBase<
  "color",
  {
    showInput?: boolean;
    initColor?: string;
  }
>;
