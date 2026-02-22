import { omit } from "lodash-es";
import { FindManyOptions, FindOptionsWhere, QueryFailedError } from "typeorm";
import { AppDataSource } from "../../lib/typeorm";
import { SystemDictDetail } from "./system-dict-detail.entity";
import { BusinessError } from "../../lib/error";
import { BusinessErrorCode } from "@rojer/mf-common";

export abstract class SystemDictDetailService {
  static get dictDetailRepo() {
    return AppDataSource.getRepository(SystemDictDetail);
  }

  static async findAndCount(options: FindManyOptions<SystemDictDetail>) {
    return await this.dictDetailRepo.findAndCount(options);
  }

  static async create(data: Partial<SystemDictDetail>) {
    try {
      const dict = this.dictDetailRepo.create(data);
      await this.dictDetailRepo.save(dict);
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
    where: FindOptionsWhere<SystemDictDetail>,
    data: Partial<SystemDictDetail>,
  ) {
    try {
      await this.dictDetailRepo.update(where, omit(data, ["systemDictId"]));
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

  static async delete(where: FindOptionsWhere<SystemDictDetail>) {
    await this.dictDetailRepo.delete(where);
  }
}
