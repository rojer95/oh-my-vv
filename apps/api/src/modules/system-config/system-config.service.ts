import { BusinessErrorCode } from "@rojer/mf-common";
import { FindManyOptions } from "typeorm";
import type { z } from "zod";
import { SystemConfig } from "../../entity/system-config.entity";
import { BusinessError } from "../../lib/error";
import { AppDataSource } from "../../lib/typeorm";
import {
  SystemConfigCreateZod,
  SystemConfigUpdateZod,
} from "./system-config.dto";

export abstract class SystemConfigService {
  static repository() {
    return AppDataSource.getRepository(SystemConfig);
  }

  static async findAndCount(options: FindManyOptions<SystemConfig>) {
    return await this.repository().findAndCount(options);
  }

  static async findById(id: number) {
    const config = await this.repository().findOne({ where: { id } });
    if (!config) {
      throw new BusinessError(BusinessErrorCode.NotFound);
    }
    return config;
  }

  static async findByKey(key: string) {
    const config = await this.repository().findOne({ where: { key } });
    if (!config) {
      throw new BusinessError(BusinessErrorCode.NotFound);
    }
    return config;
  }

  static async create(dto: z.infer<typeof SystemConfigCreateZod>) {
    const exist = await this.repository().findOne({ where: { key: dto.key } });
    if (exist) {
      throw new BusinessError(BusinessErrorCode.AlreadyExists);
    }

    const config = this.repository().create(dto);
    return await this.repository().save(config);
  }

  static async update(id: number, dto: z.infer<typeof SystemConfigUpdateZod>) {
    const config = await this.findById(id);

    if (config.buildIn) {
      throw new BusinessError(BusinessErrorCode.Forbidden);
    }

    Object.assign(config, dto);
    return await this.repository().save(config);
  }

  static async delete(id: number) {
    const config = await this.findById(id);

    if (config.buildIn) {
      throw new BusinessError(BusinessErrorCode.Forbidden);
    }

    await this.repository().remove(config);
  }
}
