import { BusinessErrorCode } from "@rojer/mf-common";
import type { FindManyOptions } from "typeorm";
import { SystemAccount } from "../../entity/system-account.entity";
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

  static async findById(id: number) {
    const account = await this.repo.findOne({ where: { id } });
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

  static async update(id: number, data: Partial<SystemAccount>) {
    const account = await this.findById(id);
    this.repo.merge(account, data);
    return await this.repo.save(account);
  }

  static async delete(id: number) {
    const account = await this.findById(id);
    account.originAccount = account.account;
    account.account = `del_${account.id}`;
    account.deletedAt = new Date();
    await this.repo.save(account);
  }

  static async resetPassword(id: number, newPassword: string) {
    const account = await this.findById(id);
    account.password = AuthService.hashPassword(newPassword);
    return await this.repo.save(account);
  }
}
