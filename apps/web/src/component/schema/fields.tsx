import { SchemaFormFiled } from "./render/schema-form-field";
import { FieldsProps } from "./typing";

export const SchemaFields = ({
  columns,
  field,
  getWrapContainer = (dom) => dom,
}: FieldsProps) => {
  return (
    <>
      {columns.map<React.ReactNode>((column, index) => {
        return (
          <SchemaFormFiled
            field={field}
            column={column}
            key={`${column.dataIndex}_${index}`}
            getWrapContainer={getWrapContainer}
          />
        );
      })}
    </>
  );
};
