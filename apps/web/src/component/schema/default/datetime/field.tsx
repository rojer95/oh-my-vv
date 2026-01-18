import { DatePicker, withField } from "@douyinfe/semi-ui";
import dayjs from "dayjs";
import { isNil } from "lodash-es";
import { useMemo } from "react";

const convert = (value: any, timestamp: boolean): any => {
  if (isNil(value)) return value;
  if (Array.isArray(value)) return value.map((i) => convert(i, timestamp));
  if (timestamp) {
    if (value > 0) {
      return dayjs.unix(value).toDate();
    }
    return undefined;
  }
  return value;
};

const transform = (value: any, timestamp: boolean): any => {
  if (Array.isArray(value)) return value.map((i) => convert(i, timestamp));
  if (timestamp) {
    if (isNil(value)) return 0;
    return dayjs(value).unix();
  }
  return value;
};

export const DatePickerField = withField(
  ({ value, onChange, timestamp = false, ...props }) => {
    const date = useMemo(() => {
      return convert(value, timestamp);
    }, [value, timestamp]);

    return (
      <DatePicker
        {...props}
        value={date}
        onChange={(v) => {
          onChange?.(transform(v, timestamp));
        }}
      />
    );
  }
);
