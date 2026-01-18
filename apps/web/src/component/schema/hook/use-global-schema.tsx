import React from "react";
import { GlobalSchemaContext } from "../context/global-schema-content";

export const useGlobalSchema = () => {
  const { schemas } = React.useContext(GlobalSchemaContext);
  return schemas;
};
