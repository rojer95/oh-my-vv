import { isArray } from "lodash-es";
import { SchemaColumnBase, SchemaDefined } from "../../typing";
import { PolygonEditorFiled, PolygonEditorProps } from "./field";

export const polygon = {
  render: (props) =>
    isArray(props.value) && props.value.length > 0
      ? `${props.value.length}个区域`
      : "未配置",
  renderForm: (props) => <PolygonEditorFiled {...props} />,
} as SchemaDefined;

export type PolygonColumn = SchemaColumnBase<"polygon", PolygonEditorProps>;
