import {
  IllustrationNoAccess,
  IllustrationNoAccessDark,
} from "@douyinfe/semi-illustrations";
import { Card, Empty } from "@douyinfe/semi-ui";

export const PageNoAccess = () => {
  return (
    <Card
      style={{
        height: "calc(((100vh - 60px) - 48px) - 40px)",
        width: "100%",
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Empty
        title="No Access"
        image={<IllustrationNoAccess style={{ width: 150, height: 150 }} />}
        darkModeImage={
          <IllustrationNoAccessDark style={{ width: 150, height: 150 }} />
        }
        layout="horizontal"
        description="很抱歉，您没有访问权限"
        style={{ width: 800, margin: "0 auto" }}
      />
    </Card>
  );
};
