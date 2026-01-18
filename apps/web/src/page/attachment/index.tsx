import { Attachment } from "@/component/attachment";
import { Card } from "@douyinfe/semi-ui";

export const AttachmentPage = () => {
  return (
    <Card>
      <Attachment pageSize={40} />
    </Card>
  );
};
