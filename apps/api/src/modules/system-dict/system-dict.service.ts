import { pick } from "lodash-es";
import { FindManyOptions, FindOptionsWhere, QueryFailedError } from "typeorm";
import { AppDataSource } from "../../lib/typeorm";
import { SystemDictDetail } from "./system-dict-detail.entity";
import { SystemDict } from "./system-dict.entity";
import { BusinessError } from "../../lib/error";
import { BusinessErrorCode } from "@rojer/mf-common";

export abstract class SystemDictService {
  static get repo() {
    return AppDataSource.getRepository(SystemDict);
  }

  static get dictDetailRepo() {
    return AppDataSource.getRepository(SystemDictDetail);
  }

  static async find(options: FindManyOptions<SystemDict>) {
    return await this.repo.find(options);
  }

  static async findAndCount(options: FindManyOptions<SystemDict>) {
    return await this.repo.findAndCount(options);
  }

  static async create(data: Partial<SystemDict>) {
    try {
      const dict: SystemDict = this.repo.create(
        pick(data, ["key", "name", "active", "note"]),
      );
      await this.repo.save(dict);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === "23505"
      ) {
        throw new BusinessError(BusinessErrorCode.DictKeyDuplicateKey);
      }
      throw error;
    }
  }

  static async update(
    where: FindOptionsWhere<SystemDict>,
    data: Partial<SystemDict>,
  ) {
    try {
      await this.repo.update(where, {
        name: data.name,
        active: data.active,
        note: data.note,
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === "23505"
      ) {
        throw new BusinessError(BusinessErrorCode.DictKeyDuplicateKey);
      }
      throw error;
    }
  }

  static async delete(where: FindOptionsWhere<SystemDict>) {
    const dict: SystemDict = await this.repo.findOneOrFail({
      where,
    });

    await this.dictDetailRepo.delete({ systemDictId: dict.id });
    await this.repo.delete(dict.id);
  }
}
