import { BusinessErrorCode } from "@rojer/mf-common";
import { isFinite, pick } from "lodash-es";
import type { FindOptionsWhere } from "typeorm";
import { BusinessError } from "../../lib/error";
import { AppDataSource } from "../../lib/typeorm";
import { SystemDepartment } from "./system-department.entity";

export abstract class SystemDepartmentService {
  static get repo() {
    return AppDataSource.getTreeRepository(SystemDepartment);
  }

  static async findTrees(tenantId: number) {
    // TODO: 根据tenantId返回部门树，按排序sort desc 排序
    return await this.repo.findTrees();
  }

  static async findOneBy(where: FindOptionsWhere<SystemDepartment>) {
    const department = await this.repo.findOne({ where });
    if (!department) {
      throw new BusinessError(BusinessErrorCode.SystemDepartmentNotFound);
    }
    return department;
  }

  static async create(data: Partial<SystemDepartment>) {
    const department = this.repo.create(data);

    // 创建，要验证上级是否设置
    if (!data.parentId) {
      throw new BusinessError(
        BusinessErrorCode.SystemDepartmentRequiredParentId,
      );
    }

    const parent = await this.findOneBy({ id: data.parentId });
    department.parent = parent;

    return await this.repo.save(department);
  }

  static async update(
    where: FindOptionsWhere<SystemDepartment>,
    data: Partial<SystemDepartment>,
  ) {
    const department = await this.findOneBy(where);

    // 修改非总部的部门，要验证上级是否设置
    if (department.parentId && !data.parentId) {
      throw new BusinessError(
        BusinessErrorCode.SystemDepartmentRequiredParentId,
      );
    }

    if (data.parentId && isFinite(data.parentId)) {
      const parent = await this.findOneBy({ id: data.parentId });
      department.parent = parent;
    }

    this.repo.merge(department, data);
    return await this.repo.save(department);
  }

  static async delete(where: FindOptionsWhere<SystemDepartment>) {
    const department = await this.findOneBy(where);

    if (!department.parentId) {
      throw new BusinessError(
        BusinessErrorCode.SystemDepartmentRootCannotDelete,
      );
    }

    const childrenCount = await this.repo.count({
      where: { parentId: department.id },
    });

    if (childrenCount > 0) {
      throw new BusinessError(BusinessErrorCode.SystemDepartmentHasChildren);
    }

    await this.repo.softRemove(department);
  }

  static async fastUpdate(
    where: FindOptionsWhere<SystemDepartment>,
    data: Partial<SystemDepartment>,
  ) {
    const department = await this.findOneBy(where);
    this.repo.merge(department, pick(data, ["active", "sort"]));
    return await this.repo.save(department);
  }
}
