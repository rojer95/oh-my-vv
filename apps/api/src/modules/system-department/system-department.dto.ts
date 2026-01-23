import z from "zod";

export const SystemDepartmentCreateZod = z.object({
  name: z.string().min(1).max(128),
  parentId: z.number().nullable().optional(),
  sort: z.number().int().nonnegative().optional().default(0),
  active: z.boolean().optional().default(true),
  tenantId: z.number().optional(),
});

export const SystemDepartmentUpdateZod = SystemDepartmentCreateZod.partial();

export const SystemDepartmentFastUpdateZod = z.object({
  active: z.boolean().optional(),
  sort: z.number().int().nonnegative().optional(),
});
