import logo from "@/asset/logo.svg";
import { IconMenu } from "@douyinfe/semi-icons";
import { Button, Layout, Nav, Space } from "@douyinfe/semi-ui";
import { PropsWithChildren } from "react";
import styled from "styled-components";
import { Dark } from "./dark";
import { Notice } from "./notice";
import { User } from "./user";
import { useLayout } from "@/hook/layout.hook";

const HeaderFooter = styled(Nav.Footer)`
  .semi-icon {
    color: var(--semi-color-text-2);
  }
`;

export const Header = ({ children }: PropsWithChildren) => {
  const { Header } = Layout;

  const { mobile, setSideNavShow, sideNavShow } = useLayout();

  return (
    <Header
      style={{
        backgroundColor: "var(--semi-color-bg-1)",
        width: "100%",
        overflowX: "auto",
      }}
    >
      <div style={{ minWidth: "max-content" }}>
        <Nav mode="horizontal">
          {mobile ? (
            <Button
              onClick={() => {
                setSideNavShow?.(!sideNavShow);
              }}
              size="large"
              icon={<IconMenu />}
              theme="borderless"
              type="tertiary"
            />
          ) : (
            <Nav.Header
              logo={
                <img
                  style={{
                    width: "auto",
                    height: 36,
                    objectFit: "contain",
                    objectPosition: "center",
                  }}
                  src={import.meta.env.VITE_LOGO || logo}
                />
              }
              text={import.meta.env.VITE_TITLE}
              style={{
                width: 220 - 24,
                marginRight: 0,
              }}
            />
          )}
          {children}
          <HeaderFooter>
            <Space>
              <Notice />
              <Dark />
              <User />
            </Space>
          </HeaderFooter>
        </Nav>
      </div>
    </Header>
  );
};
