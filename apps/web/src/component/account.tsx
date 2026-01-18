import { Tag } from "@douyinfe/semi-ui";

export const AccountString = ({ tel }: { tel: string }) => {
  return (
    <>{tel ? tel?.indexOf("del_") === 0 ? <Tag>已注销</Tag> : tel : "-"}</>
  );
};
