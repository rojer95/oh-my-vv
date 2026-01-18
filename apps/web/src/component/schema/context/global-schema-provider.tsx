import { PropsWithChildren } from "react";
import { defaultColumn } from "../default";
import {
  GlobalSchemaContext,
  GlobalSchemaContextType,
} from "./global-schema-content";

export const SchemaProvider = ({
  children,
  schemas,
}: PropsWithChildren<{
  schemas?: GlobalSchemaContextType["schemas"];
}>) => {
  return (
    <GlobalSchemaContext.Provider
      value={{
        schemas: {
          ...defaultColumn,
          ...(schemas || {}),
        },
      }}
    >
      {children}
    </GlobalSchemaContext.Provider>
  );
};
