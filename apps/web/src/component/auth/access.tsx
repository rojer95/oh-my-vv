import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement, ReactNode, useContext } from "react";
import { PermissionContext } from "../../hook/permission.hook";

export const Access = observer(
  ({
    permission,
    children,
    feedback,
  }: PropsWithChildren<{
    permission?: string;
    feedback?: ReactNode | null;
  }>) => {
    const { permissions } = useContext(PermissionContext);
    if (!permission || permissions?.includes(permission)) {
      return children as ReactElement;
    }
    return feedback as ReactElement;
  }
);
