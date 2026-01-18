import { IconHelpCircle } from "@douyinfe/semi-icons";
import { Space, Tooltip, useFormState } from "@douyinfe/semi-ui";
import { LabelProps } from "@douyinfe/semi-ui/lib/es/form";
import {
  cloneDeep,
  get,
  has,
  isArray,
  isNil,
  isPlainObject,
  omit,
  omitBy,
  set,
} from "lodash-es";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { SchemaContext } from "../context/schema-content";
import { useGlobalSchema } from "../hook/use-global-schema";
import { useSchema } from "../hook/use-schema";
import { SchemaColumn } from "../typing";
import { HiddenFormItem } from "./hidden-form-item";
import {
  generateHidden,
  generateProps,
  generateStyle,
  generateTitle,
  generateType,
} from "./util";

type SchemaFormFiledProps = {
  column: SchemaColumn;
  field?: string;
  arrayContext?: any;
  getWrapContainer?: (dom: React.ReactNode) => React.ReactNode;
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

export const SchemaFormFiled = ({
  column,
  field,
  arrayContext = undefined,
  getWrapContainer = (dom) => dom,
}: SchemaFormFiledProps) => {
  const isArrayFiled = !isNil(arrayContext);
  const semiFormState = useFormState();
  const schemas = useGlobalSchema();
  const { scene } = useSchema();
  const { dataIndex, formFieldRender, noLabel, deps } = column;
  const { changedValue: rootChangedValue, valueVersion } =
    useContext(SchemaContext);

  const preValueVersion = useRef(valueVersion);

  const realField = useMemo(
    () => (field ? [field, dataIndex].filter((i) => !!i).join(".") : dataIndex),
    [field, dataIndex]
  );

  const depsKeys = useMemo(() => {
    if (!isArray(deps)) return [];
    return deps.map((i) => {
      let depKey = i;
      let getPath = i;
      if (depKey.startsWith("$.")) {
        depKey = depKey.replace("$.", "");
        getPath = [field, depKey].filter((i) => !!i).join(".");
      }

      return {
        key: depKey,
        path: getPath,
      };
    });
  }, [deps, field]);

  const [changedValue, setChangedValue] = useState(
    depsKeys.reduce((obj, depsKey) => {
      return set(obj, depsKey.key, get(semiFormState.values, depsKey.path));
    }, {})
  );

  useEffect(() => {
    if (!depsKeys || depsKeys.length === 0) return;

    if (depsKeys.length === 1 && depsKeys[0].key === "*") {
      setChangedValue(cloneDeep(semiFormState.values));
      return;
    }

    if (preValueVersion.current !== valueVersion) {
      preValueVersion.current = valueVersion;
      setChangedValue(cloneDeep(semiFormState.values));
      return;
    }

    if (depsKeys.some((d) => has(rootChangedValue, d.path))) {
      setChangedValue(
        depsKeys.reduce((obj, depsKey) => {
          return set(obj, depsKey.key, get(semiFormState.values, depsKey.path));
        }, {})
      );
    }
  }, [rootChangedValue, depsKeys, semiFormState]);

  const schemaTitle = useMemo(() => {
    return generateTitle(
      {
        values: changedValue,
        scene,
        field: realField ?? "",
      },
      column
    );
  }, [changedValue, column, realField]);

  const schemaType = useMemo(() => {
    return generateType(
      {
        values: changedValue,
        scene,
        field: realField ?? "",
      },
      column
    );
  }, [changedValue, column, realField]);

  const schemaProps = useMemo(() => {
    return generateProps(
      {
        values: changedValue,
        scene,
        field: realField ?? "",
      },
      column,
      schemaTitle,
      schemaType
    );
  }, [changedValue, schemaTitle, column, realField, schemaType]);

  const schemaHidden = useMemo(() => {
    return generateHidden(
      {
        values: changedValue,
        scene,
        field: realField ?? "",
      },
      column
    );
  }, [changedValue, column, realField]);

  const schemaColumns = useMemo(() => {
    if (typeof column.columns === "function") {
      return column.columns({
        values: changedValue,
        scene,
        field: realField ?? "",
      });
    }

    return column.columns ?? [];
  }, [changedValue, column.columns, realField]);

  const realTitle = useMemo<LabelProps | React.ReactNode>(() => {
    if (!schemaTitle) return undefined;
    return {
      text: schemaTitle,
      extra: getLocaleExtra(column.extra, column.helper),
    };
  }, [schemaTitle, column, schemaType]);

  const RealDom = useMemo(() => {
    if (formFieldRender)
      return getWrapContainer(
        formFieldRender(
          {
            values: changedValue,
            scene,
            field: realField ?? "",
          },
          {
            field: realField ?? "",
            label: realTitle,
            style: generateStyle({
              ...column,
              width: isArrayFiled ? "100%" : column.width,
            }),
            noLabel: isArrayFiled ? true : noLabel,
            ...(schemaProps || {}),
          },
          column
        )
      );

    if (typeof schemaType === "boolean" || !schemas?.[schemaType]) return null;

    if (schemaType === "display") {
      return getWrapContainer(get(semiFormState.values, realField || "", "-"));
    }

    if (schemaHidden === true && realField)
      return (
        <HiddenFormItem
          noLabel
          field={realField}
          fieldStyle={{
            display: "none",
          }}
        />
      );

    return getWrapContainer(
      schemas?.[schemaType].renderForm(
        {
          field: realField ?? "",
          label: omitBy(
            isPlainObject(realTitle)
              ? {
                  ...(realTitle as any),
                  width: schemaProps.labelWidth || undefined,
                }
              : { text: realTitle || "" },
            isNil
          ),
          style: generateStyle({
            ...column,
            width: isArrayFiled ? "100%" : column.width,
          }),
          noLabel: isArrayFiled ? true : noLabel,
          columns: schemaColumns,
          ...omit(schemaProps, ["labelWidth", "complexEasy"]),
        },
        column
      ) ?? null
    );
  }, [
    realField,
    schemaType,
    schemaHidden,
    formFieldRender,
    changedValue,
    schemaProps,
    noLabel,
    isArrayFiled,
  ]);

  return <>{RealDom}</>;
};
