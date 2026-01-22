import { RoleDataPermType } from "@rojer/mf-common";
import z from "zod";

export const SystemRoleCreateZod = z.object({
  name: z.string().min(1).max(64),
  sort: z.number().int().nonnegative().optional().default(0),
  active: z.boolean().optional().default(true),
  menuPerm: z.array(z.string()).default([]),
  dataPermType: z.nativeEnum(RoleDataPermType).default(RoleDataPermType.all),
  department: z.array(z.number()).default([]),
  tenantId: z.number().optional(),
});

export const SystemRoleUpdateZod = SystemRoleCreateZod.partial();

export const SystemRoleFastUpdateZod = z.object({
  active: z.boolean().optional(),
  sort: z.number().int().nonnegative().optional(),
});
