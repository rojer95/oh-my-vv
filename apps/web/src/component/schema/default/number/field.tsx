import { InputNumber as SemiInputNumber, withField } from "@douyinfe/semi-ui";
import { isNil } from "lodash-es";

export const InputNumber = (props: any) => {
  return (
    <SemiInputNumber
      {...props}
      onChange={(v) => {
        if (isNil(v) || v === "") props?.onChange(undefined);
      }}
      onNumberChange={(v) => {
        props?.onChange(v);
      }}
    />
  );
};

export const InputNumberField = withField(InputNumber);
