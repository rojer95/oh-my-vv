import { BusinessErrorCode } from "@rojer/mf-common";
import { pick } from "lodash-es";
import { FindManyOptions, FindOptionsWhere, Like } from "typeorm";
import { BusinessError } from "../../lib/error";
import { AppDataSource } from "../../lib/typeorm";
import { SystemConfig } from "./system-config.entity";

export abstract class SystemConfigService {
  static get repo() {
    return AppDataSource.getRepository(SystemConfig);
  }

  static async findAndCount(options: FindManyOptions<SystemConfig>) {
    return await this.repo.findAndCount(options);
  }

  static async findOneBy(where: FindOptionsWhere<SystemConfig>) {
    const config = await this.repo.findOneBy(where);
    if (!config) {
      throw new BusinessError(BusinessErrorCode.NotFound);
    }
    return config;
  }

  static async getValueByKey<type extends number | string>(
    key: string,
    valueType: "number" | "string",
    defaultValue: type,
  ): Promise<type> {
    const config = await this.repo.findOne({ where: { key } });
    if (config) {
      if (valueType === "number" && /^(-?\d+)(\.\d+)?$/.test(config.value)) {
        return Number(config.value) as any;
      }

      if (valueType === "string" && config.value) {
        return config.value.trim() as any;
      }
    }
    return defaultValue;
  }

  static async getValueByKeyPrefix(key: string) {
    const configs = await this.repo.find({ where: { key: Like(`${key}:%`) } });
    return configs.reduce((pre, item) => {
      return { ...pre, [item.key.replace(`${key}:`, "")]: item.value };
    }, {});
  }

  static async create(data: Partial<SystemConfig>) {
    const exist = await this.repo.findOne({ where: { key: data.key } });

    if (exist) {
      throw new BusinessError(BusinessErrorCode.SystemConfigKeyAlreadyExists);
    }

    const config = this.repo.create({ ...data, buildIn: false });
    return await this.repo.save(config);
  }

  static async update(id: number, data: Partial<SystemConfig>) {
    const config = await this.findOneBy({ id });
    this.repo.merge(
      config,
      pick(data, config.buildIn ? ["value"] : ["name", "value", "note"]),
    );
    return await this.repo.save(config);
  }

  static async delete(id: number) {
    const config = await this.findOneBy({ id });

    if (config.buildIn) {
      throw new BusinessError(
        BusinessErrorCode.SystemConfigBuildInCanNotDelelte,
      );
    }

    await this.repo.remove(config);
  }
}
