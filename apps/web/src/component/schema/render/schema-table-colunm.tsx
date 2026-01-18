import { RenderOptions } from "@douyinfe/semi-ui/lib/es/table";
import { useMemo } from "react";
import { useGlobalSchema } from "../hook/use-global-schema";
import { useSchema } from "../hook/use-schema";
import { SchemaColumn, SchemaFormState } from "../typing";
import { generateProps, generateTitle, generateType } from "./util";

type SchemaTableColumnProps = {
  column: SchemaColumn;
  index: number;
  options?: RenderOptions;
  value?: any;
  record?: any;
};

export const SchemaTableColumn = ({
  column,
  value,
  index,
  options,
  record,
}: SchemaTableColumnProps) => {
  const schemas = useGlobalSchema();
  const { scene } = useSchema();
  const formState = {
    values: record,
    column,
    scene,
    field: column.dataIndex,
  } as SchemaFormState;

  const schemaType = useMemo(
    () => generateType(formState, column),
    [formState]
  );

  const schemaTitle = useMemo(
    () => generateTitle(formState, column),
    [formState]
  );

  const schemaProps = useMemo(
    () => generateProps(formState, column, schemaTitle, schemaType),
    [formState, schemaTitle, schemaType]
  );

  const dom = useMemo(() => {
    if (typeof schemaType === "boolean" || !schemas?.[schemaType]) return value;
    return (
      <>
        {schemas?.[schemaType].render(
          {
            value,
            record,
            style: column.style,
            ...schemaProps,
          },
          column
        )}
      </>
    );
  }, [value, schemas, schemaType, column]);

  const { tableColumnRender } = column;

  if (tableColumnRender)
    return <>{tableColumnRender(dom, value, record, index, options)}</>;

  return dom;
};
