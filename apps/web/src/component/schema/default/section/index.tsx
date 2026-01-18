import { SectionProps } from "@douyinfe/semi-ui/lib/es/form";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { SectionField } from "./field";

export const section = {
  render: () => null,
  renderForm: (props) => <SectionField {...props} />,
} as SchemaDefined;

export type SectionColumn = SchemaColumnBase<"section", SectionProps>;
