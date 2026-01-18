import logo from "@/asset/logo.svg";
import { useLayout } from "@/hook/layout.hook";
import { useMainRoute } from "@/hook/route.hook";
import { adminModel } from "@/mobx/admin";
import { filterMenuByProfile, getMenuFromRoute, getPathname } from "@/util";
import { Nav, SideSheet } from "@douyinfe/semi-ui";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useMatches, useNavigate } from "react-router-dom";
import styled from "styled-components";

const DIV = styled.div``;

export const LeftNav = observer(() => {
  const mainRoute = useMainRoute();
  const navigate = useNavigate();
  const { mobile, sideNavShow, setSideNavShow } = useLayout();

  const matches = useMatches();

  const menus = useMemo(() => {
    const allMenus = getMenuFromRoute(mainRoute);
    return filterMenuByProfile(allMenus, adminModel.profile);
  }, [adminModel.profile, mainRoute]);

  const items = useMemo(() => {
    const topMenu = matches.filter((i) => (i.handle as any)?.menu)?.[0];
    const matchMenu = menus.find((i) => i.itemKey === getPathname(topMenu));
    return matchMenu?.items || [];
  }, [menus, matches]);

  const selectedKeys = useMemo(() => {
    const menus = matches.filter((i) => (i.handle as any)?.menu);
    return [menus?.[menus?.length - 1]?.pathname];
  }, [items, matches]);

  const Container = useMemo(() => {
    return mobile ? SideSheet : DIV;
  }, [mobile]);

  const containerProps = useMemo(() => {
    if (!mobile)
      return {
        style: {
          overflow: "auto",
          height: "calc(100vh - 64px)",
        },
      };
    return {
      visible: sideNavShow,
      size: "small",
      placement: "left",
      closable: false,
      width: 220,
      onCancel: () => {
        setSideNavShow?.(false);
      },
      bodyStyle: { padding: 0, overflowY: "auto", overflowX: "hidden" },
      title: (
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
      ),
    } as any;
  }, [mobile, setSideNavShow, sideNavShow]);

  return items?.length > 0 ? (
    <Container {...containerProps}>
      <Nav
        style={{ maxWidth: 220 }}
        selectedKeys={selectedKeys}
        onSelect={({ itemKey }) => {
          navigate(itemKey as string);
        }}
        items={items}
      />
    </Container>
  ) : null;
});
