import { Form } from "@douyinfe/semi-ui";
import { TimePickerProps } from "@douyinfe/semi-ui/lib/es/timePicker";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { datetimeUtil } from "../../util";

export const time = {
  render: (props) => {
    return datetimeUtil.format(props.value, "time");
  },
  renderForm: (props) => {
    return <Form.TimePicker {...props} />;
  },
} as SchemaDefined;

export type TimeColunm = SchemaColumnBase<"time", TimePickerProps>;
