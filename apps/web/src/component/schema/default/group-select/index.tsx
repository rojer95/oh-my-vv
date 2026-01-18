import { Typography } from "@douyinfe/semi-ui";
import { SelectProps } from "@douyinfe/semi-ui/lib/es/select";
import { flattenDeep, uniqBy } from "lodash-es";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { GroupSelectField } from "./field";

export const groupSelect = {
  render: (props) => {
    const options = uniqBy(
      flattenDeep(props.options.map((i: any) => i.children)),
      "value"
    );
    return (
      <Typography.Text size="small">
        {options
          ?.filter((i: any) => (props.value || []).includes(i.value))
          ?.map((i: any) => i.label)
          ?.join("、") || "-"}
      </Typography.Text>
    );
  },
  renderForm: (props) => {
    return (
      <GroupSelectField
        {...props}
        style={{
          ...(props?.style || {}),
          width: props?.style?.width ?? "100%",
        }}
        title={props?.label}
      />
    );
  },
} as SchemaDefined;

export type GroupSelectColumn = SchemaColumnBase<
  "group-select",
  Omit<SelectProps, "optionList"> & {
    options: SelectProps["optionList"];
  }
>;
