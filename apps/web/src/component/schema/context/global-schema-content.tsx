import React from "react";
import { SchemaDefined } from "../typing";

export type GlobalSchemaContextType = {
  schemas: Record<string, SchemaDefined>;
};

export const GlobalSchemaContext = React.createContext<GlobalSchemaContextType>(
  {
    schemas: {},
  }
);
