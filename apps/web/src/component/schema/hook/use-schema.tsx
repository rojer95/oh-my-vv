import React from "react";
import { SchemaContext } from "../context/schema-content";

export const useSchema = () => React.useContext(SchemaContext);
