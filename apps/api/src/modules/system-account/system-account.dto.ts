import z from "zod";

export const SystemAccountCreateZod = z.object({
  account: z.string().min(2).max(32),
  password: z.string().min(6).max(32),
  realName: z.string().min(1).max(32),
  isSuper: z.boolean().default(false),
  role: z.array(z.number()).optional().default([]),
  active: z.boolean().optional(),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/)
    .optional()
    .or(z.literal("")),
  mail: z.email().optional().or(z.literal("")),
  departmentId: z.number().optional(), // 预留，部门还未实现
});

export const SystemAccountUpdateZod = SystemAccountCreateZod.pick({
  realName: true,
  isSuper: true,
  role: true,
  active: true,
  phone: true,
  mail: true,
  departmentId: true,
});

export const SystemAccountResetPasswordZod = z.object({
  newPassword: z.string().min(6).max(32),
});
