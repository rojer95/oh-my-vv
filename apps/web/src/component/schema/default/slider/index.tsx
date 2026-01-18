import { SliderProps } from "@douyinfe/semi-ui/lib/es/slider";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { SliderWithInput } from "./filed";

export const slider = {
  render: (props) => {
    if (Array.isArray(props.value)) return props.value.join("~");
    return props.value;
  },
  renderForm: (props) => <SliderWithInput {...props} />,
} as SchemaDefined;

export type SliderColumn = SchemaColumnBase<"slider", SliderProps>;
