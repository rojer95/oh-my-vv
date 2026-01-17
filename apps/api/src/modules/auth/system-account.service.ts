import { FindOptionsWhere } from "typeorm";
import { SystemAccount } from "../../entity/system-account.entity";
import { AppDataSource } from "../../lib/typeorm";

export abstract class SystemAccountService {
  static async findOneBy(where: FindOptionsWhere<SystemAccount>) {
    const repo = AppDataSource.getRepository(SystemAccount);
    return await repo.findOneBy(where);
  }
}
