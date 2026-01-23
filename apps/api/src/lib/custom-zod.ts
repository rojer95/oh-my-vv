import z from "zod";

export const zStringId = z.preprocess((val) => {
  if (typeof val === "string" && /^\d*$/.test(val)) {
    return Number.parseInt(val);
  }
  return val;
}, z.int());
