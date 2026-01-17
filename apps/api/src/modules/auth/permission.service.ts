import { In } from "typeorm";
import { SystemAccount } from "../../entity/system-account.entity";
import { SystemRole } from "../../entity/system-role.entity";
import { AppDataSource } from "../../lib/typeorm";

export abstract class PermissionService {
  static async checkPermission(
    user: SystemAccount,
    permissionKey: string
  ): Promise<boolean> {
    if (user.isSuper) {
      return true;
    }

    const roles = await AppDataSource.getRepository(SystemRole).find({
      where: {
        id: In(user.role),
        active: true,
      },
    });

    const allPermissions = new Set<string>();

    for (const role of roles) {
      role.menuPerm.forEach((p: string) => allPermissions.add(p));
    }

    return allPermissions.has(permissionKey);
  }
}
