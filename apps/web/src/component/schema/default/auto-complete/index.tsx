import { Form } from "@douyinfe/semi-ui";
import {
  AutoCompleteItems,
  AutoCompleteProps,
} from "@douyinfe/semi-ui/lib/es/autoComplete";
import { SchemaColumnBase, SchemaDefined } from "../../typing";

export const autoComplete = {
  render: (props) => props.value,
  renderForm: (props) => <Form.AutoComplete {...props} />,
} as SchemaDefined;

export type AutoCompleteColumn = SchemaColumnBase<
  "auto-complete",
  AutoCompleteProps<AutoCompleteItems>
>;
