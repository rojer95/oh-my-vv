import { SchemaColumnBase, SchemaDefined } from "../../../typing";

import { FastIndex } from "./render";

import { InputNumberField } from "../../number/field";
import "../fast.less";

type FastIndexProps = {
  permission: string;
  onSubmit: (editValue: any, record: any) => Promise<void>;
};

export const fastIndex = {
  render: (props: any) => <FastIndex {...props} />,
  renderForm: (props: any) => (
    <InputNumberField precision={0} min={0} {...props} />
  ),
} as SchemaDefined;

export type FastIndexColumn = SchemaColumnBase<"fast-index", FastIndexProps>;
