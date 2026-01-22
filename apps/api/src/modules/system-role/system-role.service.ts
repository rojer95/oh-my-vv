import { BusinessErrorCode } from "@rojer/mf-common";
import type { FindManyOptions } from "typeorm";
import { SystemRole } from "../../entity/system-role.entity";
import { BusinessError } from "../../lib/error";
import { AppDataSource } from "../../lib/typeorm";

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

  static async findById(id: number) {
    const role = await this.repo.findOne({ where: { id } });
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

  static async update(id: number, data: Partial<SystemRole>) {
    const role = await this.findById(id);
    this.repo.merge(role, data);
    return await this.repo.save(role);
  }

  static async delete(id: number) {
    const role = await this.findById(id);
    await this.repo.softRemove(role);
  }

  static async fastUpdate(id: number, data: Partial<SystemRole>) {
    const role = await this.findById(id);
    this.repo.merge(role, data);
    return await this.repo.save(role);
  }
}
