import { TagGroup } from "@douyinfe/semi-ui";

import { TagGroupStyle } from "../../style";
import { optionsUtils } from "../../util";

export const TagDisplay = (props: any) => {
  const targets = optionsUtils.getOptionArrayByValue(
    props.options,
    props.value
  );

  if (targets.length === 0) return <>-</>;
  return (
    <TagGroupStyle>
      <TagGroup
        {...props}
        tagList={targets.map((target) => {
          return {
            color: target.color || props.color,
            children: target?.label,
            type: target.type || props.type,
          };
        })}
      />
    </TagGroupStyle>
  );
};
