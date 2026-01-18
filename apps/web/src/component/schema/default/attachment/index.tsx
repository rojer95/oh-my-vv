import { SchemaColumnBase, SchemaDefined } from "@/component/schema/typing";
import { AttachmentPickerField, AttachmentPickerProps } from "./field";
import { AttachmentRender } from "./render";

export const attachment = {
  render: (props: any) => {
    return <AttachmentRender {...props} />;
  },
  renderForm: (props: any) => {
    return <AttachmentPickerField {...props} />;
  },
} as SchemaDefined;

export type AttachmenntColumn = SchemaColumnBase<
  "attachment",
  AttachmentPickerProps
>;
