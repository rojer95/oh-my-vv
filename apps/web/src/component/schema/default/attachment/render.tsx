import { FileContent } from "@/component/attachment";
import { Space } from "@douyinfe/semi-ui";
import classNames from "classnames";
import { useMemo } from "react";

export const AttachmentRender = (props: any) => {
  const { style, size } = props;
  let v = useMemo(() => {
    if (Array.isArray(props.value)) {
      return props.value;
    }

    if (props.value === "-") {
      return [];
    }

    return [props.value];
  }, [props.value]);

  return (
    <Space>
      {v.length > 0
        ? v.map((i: any) => (
            <FileContent
              style={{
                maxWidth: "100%",
                maxHeight: 100,
                ...style,
                cursor: "pointer",
              }}
              key={i}
              url={i}
              className={classNames({ [size || ""]: true })}
            />
          ))
        : "-"}
    </Space>
  );
};
