import { cloneDeep } from "lodash-es";
import { datetimeUtil } from ".";
import { generateProps, generateTitle, generateType } from "../render/util";
import {
  FilterItem,
  SchemaColumn,
  SchemaColumnFilterOperator,
  SchemaDefined,
} from "../typing";

export const filterUtils = {
  transformValue: (
    key: string,
    value: any,
    operator?: SchemaColumnFilterOperator
  ): FilterItem => {
    if (operator === "end") return { key, op: "like", value: `%${value}` };
    if (operator === "start") return { key, op: "like", value: `${value}%` };
    if (operator === "like") return { key, op: "like", value: `%${value}%` };
    return { key, op: operator || "=", value };
  },

  value2Filter: (
    formData: any,
    columns: SchemaColumn[],
    schemas: Record<any, SchemaDefined>
  ) => {
    if (!formData) return [];
    const filter: FilterItem[] = [];
    const value = cloneDeep(formData);
    for (const key in value) {
      const column = columns.find((i) => i.dataIndex === key);
      if (!column) continue;
      const title = generateTitle(
        { values: value, scene: "filter", field: column.dataIndex ?? "" },
        column
      );
      const type = generateType(
        { values: value, scene: "filter", field: column.dataIndex ?? "" },
        column
      );
      const props = generateProps(
        { values: value, scene: "filter", field: column.dataIndex ?? "" },
        column,
        title,
        type
      );
      let operator: SchemaColumnFilterOperator | undefined = column.operator;
      if (
        !operator &&
        typeof type === "string" &&
        schemas?.[type]?.defaultOperator
      ) {
        operator = schemas?.[type]?.defaultOperator;
      }
      if (
        typeof type === "string" &&
        ["date", "datetime", "time"].includes(type)
      ) {
        value[key] = datetimeUtil.format(value[key], props?.type, false);
      }
      filter.push(filterUtils.transformValue(key, value[key], operator));
    }
    return filter;
  },
};
