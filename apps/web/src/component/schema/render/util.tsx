import React, { CSSProperties } from "react";

import { LabelProps, RuleItem } from "@douyinfe/semi-ui/lib/es/form";
import { isFinite } from "lodash-es";
import { toNumber } from "../../../util";
import { formatMessage, messages } from "../../../util/validate-message";
import { SchemaColumn, SchemaFormState } from "../typing";
import { Space, Tooltip } from "@douyinfe/semi-ui";
import { IconHelpCircle } from "@douyinfe/semi-icons";

export const generateType = (
  state: SchemaFormState,
  column: SchemaColumn,
): string | boolean => {
  //  console.log("generateType", column?.dataIndex);
  if (typeof column?.type === "function") {
    return column?.type(state);
  }
  return column?.type ?? "input";
};

export const generateTitle = (
  state: SchemaFormState,
  column: SchemaColumn,
): React.ReactNode => {
  if (typeof column?.title === "function") {
    return column?.title(state);
  }
  return column?.title;
};

export const generateProps = (
  state: SchemaFormState,
  column: SchemaColumn,
  title: React.ReactNode,
  type: string | boolean,
): Record<string, any> => {
  let props: any = {};
  if (typeof column?.props === "function") {
    props = column?.props(state);
  } else {
    props = { ...(column?.props || {}) };
  }

  let ruleType = {
    textarea: "string",
    input: "string",
    number: "number",
    money: "number",
    array: "array",
  }[type as string];

  if (type === "upload" && props?.dataType !== "string") {
    ruleType = "array";
  }

  props.rules = [
    ...generateRule(state, column, title, ruleType || ""),
    ...(props?.rules || []),
  ];

  if (props?.rules?.some((i: any) => i.required)) {
    props.required = true;
  }

  for (const rule of props.rules || []) {
    if (rule.type === "number") rule.transform = toNumber;
  }

  // console.log(title, "rules", props?.rules);
  return props;
};

export const generateRule = (
  state: SchemaFormState,
  column: SchemaColumn,
  title: React.ReactNode,
  ruleType: string,
): Array<RuleItem> => {
  if (!column) return [];

  const rules: Array<RuleItem> = [];

  let required = column?.required;
  let max = column?.max;
  let len = column?.len;
  let min = column?.min;

  if (typeof required === "function") {
    required = required?.(state);
  }

  if (required === true) {
    rules.push({
      required: true,
      message: formatMessage(messages.required, title),
    });
  }

  const messageRoot = (messages as any)?.[ruleType];
  if (
    typeof ruleType === "string" &&
    (isFinite(max) || isFinite(min) || isFinite(len)) &&
    messageRoot
  ) {
    if (isFinite(len)) {
      rules.push({
        type: ruleType as any,
        len,
        message: formatMessage(messageRoot.len, title, min, max),
      });
    }

    if (isFinite(max) && isFinite(min)) {
      rules.push({
        type: ruleType as any,
        max,
        min,
        message: formatMessage(messageRoot.range, title, min, max),
      });
    }

    if (isFinite(max) && !isFinite(min)) {
      rules.push({
        type: ruleType as any,
        max,
        message: formatMessage(messageRoot.max, title, max),
      });
    }

    if (!isFinite(max) && isFinite(min)) {
      rules.push({
        type: ruleType as any,
        min,
        message: formatMessage(messageRoot.min, title, min),
      });
    }
  }

  return rules;
};

export const generateHidden = (
  state: SchemaFormState,
  column: SchemaColumn,
): boolean => {
  if (typeof column?.hiddenInForm === "function") {
    return column?.hiddenInForm(state);
  }
  return !!column?.hiddenInForm;
};

export const generateStyle = (column: SchemaColumn): CSSProperties => {
  let style: CSSProperties = {};
  if (typeof column.style === "object") style = { ...column.style };
  if (
    typeof column.width === "number" ||
    (typeof column.width === "string" && column.width.trim() !== "")
  ) {
    style.width = column.width;
  }
  return style;
};

export const generateColumns = (
  state: SchemaFormState,
  column: SchemaColumn,
): SchemaColumn[] => {
  if (typeof column.columns === "function") {
    return column.columns({
      values: state?.values,
      scene: state?.scene,
      field: state?.field ?? "",
    });
  }
  return column.columns ?? [];
};

const getLocaleExtra = (extra: any, helper?: React.ReactNode) => {
  let isHelper = false;

  if (helper) isHelper = true;

  if (!extra && !isHelper) return undefined;

  return (
    <Space>
      {extra}
      {isHelper ? (
        <Tooltip content={helper}>
          <IconHelpCircle style={{ color: "--semi-color-text-1" }} />
        </Tooltip>
      ) : null}
    </Space>
  );
};

export const generateRealTitle = (
  schemaTitle: React.ReactNode,
  column: SchemaColumn,
): LabelProps | React.ReactNode => {
  if (!schemaTitle) return undefined;
  return {
    text: schemaTitle,
    extra: getLocaleExtra(column.extra, column.helper),
  };
};
