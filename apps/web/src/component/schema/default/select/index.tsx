import { Form } from "@douyinfe/semi-ui";
import { SelectProps } from "@douyinfe/semi-ui/lib/es/select";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { optionsUtils } from "../../util";
import { TagDisplay } from "../common/tag";

export const select = {
  render: (props) => {
    if (props.group) {
      return props?.options
        ?.map((i: any) => {
          return optionsUtils.getLabelStringByValue(i.children, props.value);
        })
        ?.join("、");
    }

    if (props?.tag) {
      return <TagDisplay {...props} />;
    }

    return optionsUtils.getLabelStringByValue(props.options, props.value);
  },
  renderForm: (props) => {
    const data = optionsUtils.transfrom(
      props.options,
      "value",
      "label",
      !(props?.filter === true)
    );
    return (
      <Form.Select
        {...props}
        style={{
          ...(props?.style || {}),
          width: props?.style?.width ?? "100%",
        }}
        renderSelectedItem={(item: any) => {
          if (props.multiple) {
            return {
              isRenderInTag: true,
              content: optionsUtils.nullValue(item, props.nullValue),
            };
          } else {
            return optionsUtils.nullValue(item, props.nullValue);
          }
        }}
        optionList={data}
      />
    );
  },
} as SchemaDefined;

export type SelectColumn = SchemaColumnBase<
  "select",
  Omit<SelectProps, "optionList"> & {
    options: SelectProps["optionList"];
  }
>;
