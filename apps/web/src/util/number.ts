import { isNil } from "lodash-es";

export const toNumber = (v: number | string | null | undefined) =>
  isNil(v) || String(v).trim() === "" ? undefined : Number(v);
