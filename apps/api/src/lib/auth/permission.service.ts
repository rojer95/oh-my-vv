import { SystemAccount } from "../../entity/system-account.entity";
import { SystemRole } from "../../entity/system-role.entity";
import { AppDataSource } from "../typeorm/db";

export async function checkPermission(
  user: SystemAccount,
  permissionKey: string
): Promise<boolean> {
  if (user.isSuper) {
    return true;
  }

  const roles = await AppDataSource.getRepository(SystemRole)
    .createQueryBuilder("role")
    .where("role.id IN (:...roleIds)", { roleIds: user.role })
    .andWhere("role.active = :active", { active: true })
    .getMany();

  const allPermissions = new Set<string>();
  for (const role of roles) {
    role.menuPerm.forEach((p: string) => allPermissions.add(p));
  }

  return allPermissions.has(permissionKey);
}
