import { isNil } from "lodash-es";

export const optionsUtils = {
  transfrom: (
    option: string | Array<any>,
    valueKey = "value",
    labelKey = "label",
    isSpan = true,
  ) => {
    let ops: string | Array<any> = option;
    if (typeof ops === "string") {
      ops = Array.from(new Set(ops.split(/[\n\r]/).filter((i) => !!i))).map(
        (i) => ({
          label: i,
          value: i,
        }),
      );
    }

    if (!Array.isArray(ops)) return [];

    return ops.map((i) => ({
      ...i,
      label: isSpan ? (
        <span key={i?.[valueKey]}>{i?.[labelKey]}</span>
      ) : (
        i?.[labelKey]
      ),
      value: i?.[valueKey],
    }));
  },

  getOptionArrayByValue: (
    option: string | Array<any>,
    value: any,
    valueKey = "value",
    labelKey = "label",
    isSpan = true,
  ) => {
    if (value === undefined || value === null) return [];
    const ops = optionsUtils.transfrom(option, valueKey, labelKey, isSpan);
    let arrValue = value;
    if (!Array.isArray(arrValue)) arrValue = [arrValue];
    return ops?.filter((i) => arrValue?.includes(i.value)) ?? [];
  },

  getLabelStringByValue: (
    option: string | Array<any>,
    value: any,
    valueKey = "value",
    labelKey = "label",
  ) => {
    const options = optionsUtils.getOptionArrayByValue(
      option,
      value,
      valueKey,
      labelKey,
      false,
    );

    return options?.length === 0
      ? "-"
      : options.map((i) => i?.label).join("、");
  },

  nullValue: (item: any, nullValue = 0) => {
    if (isNil(item?.value) || item?.value === nullValue) return undefined;
    return item?.label;
  },
};
