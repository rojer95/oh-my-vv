import { CommonFieldProps } from "@douyinfe/semi-ui/lib/es/form";
import React, { CSSProperties, ReactNode } from "react";

import { ButtonProps } from "@douyinfe/semi-ui/lib/es/button";
import { PopconfirmProps } from "@douyinfe/semi-ui/lib/es/popconfirm";
import { SpaceProps } from "@douyinfe/semi-ui/lib/es/space";
import {
  Align,
  ColumnProps,
  ColumnRenderReturnType,
  RenderOptions,
} from "@douyinfe/semi-ui/lib/es/table";
import { DefaultSchemaColumn } from "./default";

export type SchemaColumn = DefaultSchemaColumn | SchemaColumnBase;

export type SchemaScene = "form" | "table" | "filter";

export type SchemaFormState = {
  values: any;
  scene: SchemaScene;
  field: string;
};

export type SchemaGetter<T> = (state: SchemaFormState) => T;

export type SchemaProps<T> = Omit<CommonFieldProps, "field" | "label"> & {
  complexEasy?: boolean;
} & Partial<T>;

export type SchemaColumnFilterOperator =
  | "="
  | ">"
  | ">="
  | "<"
  | "<="
  | "<>"
  | "like"
  | "in"
  | "notIn"
  | "between"
  | "notBetween"
  | "end"
  | "start";

export type FilterItem = {
  key: string;
  value: any;
  op?:
    | "="
    | ">"
    | ">="
    | "<"
    | "<="
    | "<>"
    | "like"
    | "in"
    | "notIn"
    | "between"
    | "notBetween";
};

export type TableRowActionProps = {
  key: string;
  popconfirmProps?: PopconfirmProps;
  requestInput?: { title?: string; columns: SchemaColumn[]; initValue?: any };
  onClick?: (data?: any) => void | Promise<void>;
  text?: React.ReactNode;
  type?: ButtonProps["type"];
  color?: string;
  icon?: ButtonProps["icon"];
  theme?: ButtonProps["theme"] | "a";
  reload?: any;
  disabled?: boolean;
  visible?: () => boolean;
  permission?: string;
  more?: boolean;
  tooltip?: string;
  sort?: number;
};

export type SchemaColumnBase<
  Type extends string = string,
  Props extends Record<string, any> = any,
> = {
  type?: Type | SchemaGetter<string | boolean>;
  props?: SchemaProps<Props> | SchemaGetter<SchemaProps<Props>>;
  title?: React.ReactNode | SchemaGetter<React.ReactNode>;
  extra?: React.ReactNode;
  dataIndex?: string;
  operator?: SchemaColumnFilterOperator;
  helper?: React.ReactNode;
  deps?: string[];
  width?: string | number;
  required?: boolean | SchemaGetter<boolean>;
  max?: number;
  min?: number;
  len?: number;
  precision?: number;
  style?: CSSProperties;
  columns?: SchemaColumn[] | SchemaGetter<SchemaColumn[]>;
  align?: Align;
  showInFilter?: boolean;
  hiddenInTable?: boolean;
  hiddenInForm?: boolean | SchemaGetter<boolean>;
  sorter?: boolean;
  noLabel?: boolean;
  formFieldRender?: (
    state: SchemaFormState,
    props?: any,
    column?: SchemaColumn
  ) => React.ReactNode;
  tableColumnRender?: (
    dom: ReactNode,
    text: any,
    record: any,
    index: number,
    options?: RenderOptions
  ) => ColumnRenderReturnType;
  tableActionRender?: (record: any, index?: number) => TableRowActionProps[];
} & Partial<
  Omit<ColumnProps, "width" | "render" | "sorter" | "title" | "dataIndex">
>;

type SchemaDefinedRenderProps = {
  value: any;
  record: any;
  style?: React.CSSProperties;
  [key: string]: any;
};

export type SchemaDefined = {
  render: (
    props: SchemaDefinedRenderProps,
    column?: SchemaColumn
  ) => React.ReactNode;
  renderForm: (
    props: CommonFieldProps & Record<string, any>,
    column: SchemaColumn
  ) => React.ReactNode;
  defaultOperator?: SchemaColumnFilterOperator;
};

export type ActionProps = SpaceProps;

export type FieldsProps = {
  columns: Array<SchemaColumn>;
  field?: string;
  getWrapContainer?: (dom: React.ReactNode) => React.ReactNode;
};
