import { Form, TagGroup } from "@douyinfe/semi-ui";
import { TagInputProps } from "@douyinfe/semi-ui/lib/es/tagInput";
import { SchemaColumnBase, SchemaDefined } from "../../typing";

export const tagInput = {
  render: (props) => (
    <TagGroup
      tagList={
        props.value?.map((i: any) => ({
          color: props.color ?? "blue",
          children: i,
        })) ?? []
      }
    />
  ),
  renderForm: (props) => <Form.TagInput {...props} />,
} as SchemaDefined;

export type TagInputColumn = SchemaColumnBase<"tag-input", TagInputProps>;
