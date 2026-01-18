import { LayoutProvider } from "@/hook/layout.hook";
import { PermissionProvider } from "@/hook/permission.hook";
import { adminModel } from "@/mobx/admin";
import { checkAccess } from "@/util";
import { Layout, Spin } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, useMemo, useState } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { Header } from "./header";
import { HeaderNav } from "./header/nav";
import { LeftNav } from "./nav";
import { PageNoAccess } from "./no-access";

export const MainLayout = observer(({ children }: PropsWithChildren) => {
  const { Footer, Content } = Layout;

  const matches = useMatches();
  const [mobile, setMobile] = useState(false);
  const [sideNavShow, setSideNavShow] = useState(false);

  const Children = useMemo(() => {
    if (!adminModel.profile) return null;
    const last = matches[matches.length - 1];
    if (
      checkAccess((last?.handle as any)?.access, adminModel.profile.permissions)
    ) {
      return children ? children : <Outlet />;
    }
    return <PageNoAccess />;
  }, [adminModel.profile, matches]);

  return (
    <PermissionProvider
      value={{
        permissions: adminModel?.profile?.permissions || [],
      }}
    >
      <LayoutProvider
        value={{
          mobile,
          sideNavShow,
          setSideNavShow,
        }}
      >
        <Spin spinning={adminModel.loading}>
          <Layout>
            <Header>
              <HeaderNav />
            </Header>
            <Layout>
              <Layout.Sider
                breakpoint={["md"]}
                onBreakpoint={(_, broken) => {
                  setMobile(!broken);
                }}
                style={{
                  backgroundColor: "var(--semi-color-bg-1)",
                }}
              >
                <LeftNav />
              </Layout.Sider>
              <Content
                style={{
                  padding: "24px",
                  backgroundColor: "rgba(var(--semi-grey-0), 1)",
                  height: "calc(100vh - 60px)",
                }}
              >
                <div
                  style={{
                    minHeight: "calc(100vh - 60px - 48px - 40px)",
                  }}
                >
                  {Children}
                </div>
                <Footer
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: "20px",
                    color: "var(--semi-color-text-2)",
                    backgroundColor: "rgba(var(--semi-grey-0), 1)",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span>{import.meta.env.VITE_COPYRIGHT}</span>
                  </span>
                </Footer>
              </Content>
            </Layout>
          </Layout>
        </Spin>
      </LayoutProvider>
    </PermissionProvider>
  );
});
