import { Typography } from "@douyinfe/semi-ui";
import { cloneDeep } from "lodash-es";
import { useMemo } from "react";

const findDeep = (treeData: any[], i: any): string | undefined => {
  for (const item of treeData) {
    if (item.value === i) {
      return item.label;
    }

    if (item?.children?.length > 0) {
      const childresult = findDeep(item.children, i);

      if (childresult) {
        return childresult;
      }
    }
  }

  return undefined;
};

export const CascaderRender = ({
  value = [],
  treeData = [],
  multiple = false,
}) => {
  const tagList = useMemo(() => {
    let _value: any[] = cloneDeep(value || []);

    if (multiple) {
      _value = (value || []).map((i: any[]) => i[i.length - 1]);
    }

    return _value
      .map((i) => {
        return findDeep(treeData, i);
      })
      .filter((i) => !!i)
      .map((i) => ({ children: i }));
  }, [treeData, value]);

  return tagList?.length === 0 ? (
    <>-</>
  ) : (
    <Typography.Text size="small">
      {tagList.map((i) => i.children).join("、")}
    </Typography.Text>
  );
};
