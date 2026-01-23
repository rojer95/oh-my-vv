import { BusinessErrorCode } from "@rojer/mf-common";
import type { FindManyOptions, FindOptionsWhere } from "typeorm";
import { SystemAccount } from "./system-account.entity";
import { BusinessError } from "../../lib/error";
import { AppDataSource } from "../../lib/typeorm";
import { AuthService } from "../auth/auth.service";

export abstract class SystemAccountService {
  static get repo() {
    return AppDataSource.getRepository(SystemAccount);
  }

  static async find(options: FindManyOptions<SystemAccount>) {
    return await this.repo.find(options);
  }

  static async findAndCount(options: FindManyOptions<SystemAccount>) {
    return await this.repo.findAndCount(options);
  }

  static async findOneBy(where: FindOptionsWhere<SystemAccount>) {
    const account = await this.repo.findOneBy(where);
    if (!account) {
      throw new BusinessError(BusinessErrorCode.SystemAccountNotFound);
    }
    return account;
  }

  static async create(data: Partial<SystemAccount>) {
    const exist = await this.repo.findOne({ where: { account: data.account } });
    if (exist) {
      throw new BusinessError(BusinessErrorCode.SystemAccountAlreadyExists);
    }

    const account = this.repo.create({
      ...data,
      accountType: "platform",
      tenantId: 0,
      password: AuthService.hashPassword(data.password!),
      loginCount: 0,
    });

    return await this.repo.save(account);
  }

  static async update(
    where: FindOptionsWhere<SystemAccount>,
    data: Partial<SystemAccount>,
  ) {
    const account = await this.findOneBy(where);
    this.repo.merge(account, data);
    return await this.repo.save(account);
  }

  static async delete(where: FindOptionsWhere<SystemAccount>) {
    const account = await this.findOneBy(where);
    account.originAccount = account.account;
    account.account = `del_${account.id}`;
    account.deletedAt = new Date();
    await this.repo.save(account);
  }

  static async resetPassword(
    where: FindOptionsWhere<SystemAccount>,
    newPassword: string,
  ) {
    const account = await this.findOneBy(where);
    account.password = AuthService.hashPassword(newPassword);
    return await this.repo.save(account);
  }
}
