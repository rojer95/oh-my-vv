import { Form, Space, Tag, useFormApi } from "@douyinfe/semi-ui";

export const QuickInput = ({
  field,
  quick,
  ...props
}: {
  quick?: string[];
  field: string;
}) => {
  const formApi = useFormApi();
  return (
    <>
      <Form.Input field={field} {...props} />
      <Space>
        {Array.from(new Set(quick)).map((i) => (
          <Tag
            onClick={() => {
              formApi?.setValue(field, i);
            }}
            type="light"
            key={i}
            style={{
              cursor: "pointer",
              backgroundColor: "var(--semi-color-primary-light-default)",
              color: "var(--semi-color-primary)",
            }}
          >
            {i}
          </Tag>
        ))}
      </Space>
    </>
  );
};
