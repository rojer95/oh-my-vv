import z from "zod";

export const SystemDictCreateZod = z.object({
  name: z.string().min(1).max(128),
  key: z.string().min(1).max(128),
  active: z.boolean().optional().default(true),
  note: z.string().max(512).nullish(),
});

export const SystemDictFastUpdateZod = z.object({
  active: z.boolean().optional(),
});
