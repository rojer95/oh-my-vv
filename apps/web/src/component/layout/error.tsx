import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from "@douyinfe/semi-illustrations";
import { Button, Card, Empty } from "@douyinfe/semi-ui";
import { useEffect, useMemo } from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import { MainLayout } from "./main";

export const PageError = () => {
  const error: any = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    if (error?.code === 401) {
      navigate("/");
    }
  }, [error]);

  return (
    <MainLayout>
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
          title={error?.statusText || error.name}
          image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
          darkModeImage={
            <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
          }
          layout="horizontal"
          description={error?.data || error.message}
          style={{ width: 800, margin: "0 auto" }}
        />
      </Card>
    </MainLayout>
  );
};

export const RootErrorPage = () => {
  const error: any = useRouteError();
  const navigate = useNavigate();

  const errorName = useMemo(() => {
    if (error.status === 404) return "404";
    return error.statusText || error.name;
  }, [error]);

  const errorMessage = useMemo(() => {
    if (error.status === 404) return "非常抱歉，您访问的页面不存在";
    return error?.data || error.message;
  }, [error]);

  return (
    <Card
      style={{
        height: "100vh",
        width: "100%",
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Empty
        title={errorName}
        image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
        darkModeImage={
          <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
        }
        layout="horizontal"
        description={errorMessage}
        style={{ width: 800, margin: "0 auto" }}
      >
        <div>
          <Button
            style={{ padding: "6px 24px", marginRight: 12 }}
            type="primary"
            onClick={() => {
              navigate(-1);
            }}
          >
            返回上一页
          </Button>
          <Button
            style={{ padding: "6px 24px" }}
            theme="solid"
            type="primary"
            onClick={() => {
              navigate(`/dashboard`);
            }}
          >
            返回首页
          </Button>
        </div>
      </Empty>
    </Card>
  );
};
