import z from "zod";

export const SystemConfigCreateZod = z.object({
  name: z.string().min(1).max(128),
  key: z.string().min(1).max(128),
  value: z.string().min(1).max(1024),
  buildIn: z.boolean().optional().default(false),
  note: z.string().max(512).optional(),
});

export const SystemConfigUpdateZod = z.object({
  name: z.string().min(1).max(128).optional(),
  value: z.string().min(1).max(1024).optional(),
  note: z.string().max(512).optional(),
});

export const SystemConfigQueryZod = z.object({
  page: z.coerce.number().default(1),
  size: z.coerce.number().default(10),
  name: z.string().optional(),
  key: z.string().optional(),
});
