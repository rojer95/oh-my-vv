import React from "react";

export type SchemaScene = "form" | "table" | "filter";

export const SchemaContext = React.createContext<{
  scene: SchemaScene;
  changedValue: any;
  valueVersion: number;
}>({
  scene: "form",
  changedValue: {},
  valueVersion: 0,
});
