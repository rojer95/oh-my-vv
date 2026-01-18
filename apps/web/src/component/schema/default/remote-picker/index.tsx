import { ReactNode } from "react";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { RemotePickerField, RemotePickerProps } from "./field";

export const remotePicker: SchemaDefined = {
  render: function (): ReactNode {
    return null;
  },
  renderForm: function (props: any): ReactNode {
    return <RemotePickerField {...props} />;
  },
};
export type RemotePickerColumn = SchemaColumnBase<
  "remote-picker",
  RemotePickerProps
>;
