import { InputNumber, Slider, Space, withField } from "@douyinfe/semi-ui";
import { isNaN, isNil } from "lodash-es";
import { useMemo } from "react";

export const SliderWithInput = withField(
  ({ value, onChange, range = false, ...props }) => {
    const realValue = useMemo(() => {
      if (isNil(value) || isNaN(Number(value)) || value === "") {
        return undefined;
      }
      return Number(value);
    }, [value]);

    return range ? (
      <Slider {...props} value={value} onChange={onChange} range />
    ) : (
      <Space style={{ width: "100%" }}>
        <div style={{ flexGrow: 1, marginRight: 15 }}>
          <Slider
            {...props}
            value={realValue || 0}
            onChange={(value) => onChange(value)}
          />
        </div>
        <InputNumber
          onChange={(v) => onChange(v)}
          style={{ width: 90 }}
          value={realValue}
          precision={0}
          step={props.step}
          min={0}
          max={props.max}
          showClear
        />
      </Space>
    );
  }
);
