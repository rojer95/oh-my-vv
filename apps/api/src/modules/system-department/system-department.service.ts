import { BusinessErrorCode } from "@rojer/mf-common";
import { isFinite, pick } from "lodash-es";
import {
  EntityTarget,
  IsNull,
  ObjectLiteral,
  TreeRepositoryNotSupportedError,
  type FindOptionsWhere,
} from "typeorm";
import { BusinessError } from "../../lib/error";
import { AppDataSource } from "../../lib/typeorm/typeorm";
import { SystemDepartment } from "./system-department.entity";
import {
  SortableTreeRepository,
  sortableTreeRepositoryMethods,
} from "../../lib/typeorm/sortable-tree.repository";

export abstract class SystemDepartmentService {
  static get repo() {
    return AppDataSource.getTreeRepository(SystemDepartment);
  }

  static async findTrees(tenantId: number) {
    return await AppDataSource.transaction(async (t) => {
      const repo: SortableTreeRepository<SystemDepartment> = t
        .getTreeRepository(SystemDepartment)
        .extend(sortableTreeRepositoryMethods);

      let root = await repo.findOneBy({
        tenantId,
        parentId: IsNull(),
      });

      if (!root) {
        root = repo.create({
          tenantId,
          name: "总部",
        });

        await repo.save(root);
      }

      const rootTree = await repo.findDescendantsTree(root, {
        where: {
          tenantId,
        },
        order: { sort: "DESC", id: "ASC" },
      });

      return [rootTree];
    });
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

    // 如果修改了父级
    if (data.parentId && department.parentId !== data.parentId) {
      const parent = await this.findOneBy({ id: data.parentId });
      // 不能将自身及下级设置为上级部门
      if (parent.path.startsWith(department.path)) {
        throw new BusinessError(BusinessErrorCode.SystemDepartmentBadParentId);
      }
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
