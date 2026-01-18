import { DatePickerProps } from "@douyinfe/semi-ui/lib/es/datePicker";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { DatePickerField } from "./field";
import { datetimeUtil } from "../../util";

export const datetime = {
  render: (props) => {
    return datetimeUtil.format(props.value, props.type || "dateTime");
  },
  renderForm: (props) => (
    <DatePickerField
      {...props}
      type={props.type || "dateTime"}
      insetInput={props.insetInput ?? true}
    />
  ),
  defaultOperator: "between",
} as SchemaDefined;

export type DateTimeColunm = SchemaColumnBase<
  "datetime",
  DatePickerProps & {
    timestamp?: boolean;
  }
>;
