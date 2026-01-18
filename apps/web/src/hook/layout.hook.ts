import { createContext, useContext } from "react";

const LayoutContext = createContext<{
  mobile?: boolean;
  sideNavShow?: boolean;
  setSideNavShow?: (v: boolean) => void;
}>({});

export const LayoutProvider = LayoutContext.Provider;

export const useLayout = () => {
  return useContext(LayoutContext);
};
