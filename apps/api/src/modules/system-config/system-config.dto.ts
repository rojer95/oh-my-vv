import z from "zod";

export const SystemConfigCreateZod = z.object({
  name: z.string().min(1).max(128),
  key: z.string().min(1).max(128),
  value: z.string().min(1).max(1024),
  note: z.string().max(512).optional(),
});

export const SystemConfigUpdateZod = SystemConfigCreateZod.pick({
  name: true,
  value: true,
  note: true,
});
