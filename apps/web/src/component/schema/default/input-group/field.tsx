import { Form, LabelProps } from "@douyinfe/semi-ui/lib/es/form";
import { ReactNode } from "react";
import { SchemaFields } from "../../fields";
import { SchemaColumn } from "../../typing";

export type MyInputGroupProps = {
  columns?: Array<SchemaColumn>;
  field: string;
  label?: LabelProps | ReactNode;
  noLabel?: boolean;
};

export const InputGroup = ({
  field,
  columns,
  label,
  noLabel,
}: MyInputGroupProps) => {
  return (
    <Form.Slot label={label} noLabel={noLabel}>
      <div className="semi-input-group">
        <SchemaFields columns={columns || []} field={field} />
      </div>
    </Form.Slot>
  );
};
