import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { DSlateSemiField } from "./filed";

export const dslate = {
  render: () => null,
  renderForm: (props) => <DSlateSemiField {...props} />,
} as SchemaDefined;

export type DSlateColumn = SchemaColumnBase<"dslate", any>;
