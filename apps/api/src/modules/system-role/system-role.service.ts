import { BusinessErrorCode } from "@rojer/mf-common";
import type { FindManyOptions, FindOptionsWhere } from "typeorm";
import { BusinessError } from "../../lib/error";
import { AppDataSource } from "../../lib/typeorm/typeorm";
import { SystemRole } from "./system-role.entity";

export abstract class SystemRoleService {
  static get repo() {
    return AppDataSource.getRepository(SystemRole);
  }

  static async find(options: FindManyOptions<SystemRole>) {
    return await this.repo.find(options);
  }

  static async findAndCount(options: FindManyOptions<SystemRole>) {
    return await this.repo.findAndCount(options);
  }

  static async findOneBy(where: FindOptionsWhere<SystemRole>) {
    const role = await this.repo.findOneBy(where);
    if (!role) {
      throw new BusinessError(BusinessErrorCode.SystemRoleNotFound);
    }
    return role;
  }

  static async create(data: Partial<SystemRole>) {
    const role = this.repo.create({
      ...data,
      tenantId: data.tenantId || 0,
    });
    return await this.repo.save(role);
  }

  static async update(
    where: FindOptionsWhere<SystemRole>,
    data: Partial<SystemRole>,
  ) {
    const role = await this.findOneBy(where);
    this.repo.merge(role, data);
    return await this.repo.save(role);
  }

  static async delete(where: FindOptionsWhere<SystemRole>) {
    const role = await this.findOneBy(where);
    await this.repo.softRemove(role);
  }

  static async fastUpdate(
    where: FindOptionsWhere<SystemRole>,
    data: Partial<SystemRole>,
  ) {
    const role = await this.findOneBy(where);
    this.repo.merge(role, data);
    return await this.repo.save(role);
  }
}
