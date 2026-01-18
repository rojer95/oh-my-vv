import { Space } from "@douyinfe/semi-ui";

export const FileRender = (props: any) => {
  const { style } = props;
  let v = [];
  if (Array.isArray(props.value)) {
    v = props.value;
  } else if (props.value) {
    v = [props.value];
  }

  return (
    <Space>
      {v.map((i: any) => (
        <img
          style={{
            maxWidth: "100%",
            maxHeight: 100,
            ...style,
            cursor: "pointer",
          }}
          key={i}
          src={i}
        />
      ))}
    </Space>
  );
};
