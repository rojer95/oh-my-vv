import { Badge, Space } from "@douyinfe/semi-ui";
import { useMemo } from "react";
import { optionsUtils } from "../../util";

export const StatusRender = (props: any) => {
  const Ret = useMemo(() => {
    const targets = optionsUtils.getOptionArrayByValue(
      props.options,
      props.value
    );

    if (targets.length === 0) return "-";
    return targets.map((target) => {
      if (target.color || target.type) {
        return (
          <span key={target.value}>
            <Badge
              dot
              type={target.type}
              style={{
                backgroundColor: target.color,
                marginRight: 6,
              }}
            />
            {target?.label}
          </span>
        );
      }

      return target.label;
    });
  }, [props?.options, props?.value]);
  return Ret.length > 1 ? <Space>{Ret}</Space> : <>{Ret}</>;
};
