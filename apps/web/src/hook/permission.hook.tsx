import React, { useContext } from "react";

export const PermissionContext = React.createContext<{ permissions: string[] }>(
  { permissions: [] }
);

export const PermissionProvider = PermissionContext.Provider;

export const usePermissions = () => {
  return useContext(PermissionContext);
};
