import z from "zod";

export const SystemDictDetailCreateZod = z.object({
  systemDictId: z.number().int(),
  name: z.string().min(1).max(128),
  key: z.string().min(1).max(128),
  active: z.boolean().optional().default(true),
  sort: z.int().optional().default(0),
  note: z.string().max(512).nullish(),
  style: z.string().max(512).nullish(),
  color: z.string().max(36).nullish(),
});

export const SystemDictDetailFastUpdateZod = z.object({
  active: z.boolean().optional(),
  sort: z.int().optional(),
});
