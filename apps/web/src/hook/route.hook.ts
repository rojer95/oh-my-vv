import { useContext, useMemo } from "react";
import { RouteObject, UNSAFE_DataRouterContext } from "react-router-dom";
import { findRoute } from "@/util";

export const useMainRoute = () => {
  const routeContext = useContext(UNSAFE_DataRouterContext);
  const mainRoute = useMemo<RouteObject[]>(() => {
    return (
      findRoute(
        routeContext?.router.routes || [],
        (i) => i.handle?.mainRoute === true,
      )?.children || []
    );
  }, [routeContext?.router.routes]);

  return mainRoute;
};
