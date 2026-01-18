import { Switch, withField } from "@douyinfe/semi-ui";
import { InputNumber } from "../number/field";

export const StockField = withField(({ value, onChange, ...props }) => {
  return (
    <InputNumber
      {...props}
      onChange={onChange}
      value={value === -1 ? undefined : value}
      precision={0}
      min={0}
      disabled={value === -1}
      placeholder={value === -1 ? "无限库存" : ""}
      suffix={
        <Switch
          uncheckedText="限"
          checkedText="∞"
          onChange={(checked) => {
            if (checked) {
              onChange?.(-1);
            } else {
              onChange?.(undefined);
            }
          }}
          checked={value === -1}
        />
      }
      hideButtons
    />
  );
});
