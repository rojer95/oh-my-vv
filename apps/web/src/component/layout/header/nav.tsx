import { Nav } from "@douyinfe/semi-ui";
import { SubNavPropsWithItems } from "@douyinfe/semi-ui/lib/es/navigation";
import { useMemo } from "react";
import { useMatches, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { adminModel } from "@/mobx/admin";
import { filterMenuByProfile, getMenuFromRoute, getPathname } from "@/util";
import { observer } from "mobx-react-lite";
import { useMainRoute } from "@/hook/route.hook";

const MyNav = styled(Nav as any)`
  .semi-navigation-item-selected {
    .semi-navigation-item-text {
      color: var(--semi-color-primary);
    }
  }
`;

const getFirstRoute = (menu: SubNavPropsWithItems): string => {
  if (!menu.items || menu.items.length === 0) return menu.itemKey as string;
  return getFirstRoute(menu.items?.[0] as SubNavPropsWithItems);
};

export const HeaderNav = observer(() => {
  const mainRoute = useMainRoute();
  const matches = useMatches();
  const navigate = useNavigate();

  const menus = useMemo(() => {
    const allMenus = getMenuFromRoute(mainRoute) || [];
    return filterMenuByProfile(allMenus, adminModel.profile);
  }, [adminModel.profile, mainRoute]);

  const items = useMemo(() => {
    return menus.map((i) => ({
      itemKey: i.itemKey,
      text: i.text,
    }));
  }, [menus]);

  const selectedKeys = useMemo(() => {
    const selecteds = matches.filter((i) => (i?.handle as any)?.menu);

    if (selecteds.length > 0) {
      return [getPathname(selecteds?.[0])];
    }

    return [];
  }, [matches]);

  return (
    <MyNav
      mode="horizontal"
      items={items}
      selectedKeys={selectedKeys}
      onSelect={({ itemKey }: any) => {
        const matchMenu = menus?.find((i) => i.itemKey === itemKey);
        if (!matchMenu) return;
        const pathname = getFirstRoute(matchMenu);
        if (pathname) navigate(pathname);
      }}
      footer={{
        collapseButton: true,
      }}
    />
  );
});
