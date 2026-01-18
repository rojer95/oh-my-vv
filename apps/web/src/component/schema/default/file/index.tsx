import { UploadProps } from "@/component/upload";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { Upload } from "./field";
import { FileRender } from "./render";

export const file = {
  render: (props: any) => {
    return <FileRender {...props} />;
  },
  renderForm: ({ ...props }) => {
    return <Upload {...props} />;
  },
} as SchemaDefined;

export type FileColumn = SchemaColumnBase<
  "file",
  Omit<UploadProps, "value" | "onChange">
>;
