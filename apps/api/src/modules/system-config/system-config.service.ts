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
import { pick } from "lodash-es";

export abstract class SystemConfigService {
  static get repo() {
    return AppDataSource.getRepository(SystemConfig);
  }

  static async findAndCount(options: FindManyOptions<SystemConfig>) {
    return await this.repo.findAndCount(options);
  }

  static async findById(id: number) {
    const config = await this.repo.findOne({ where: { id } });
    if (!config) {
      throw new BusinessError(BusinessErrorCode.NotFound);
    }
    return config;
  }

  static async findByKey(key: string) {
    const config = await this.repo.findOne({ where: { key } });
    if (!config) {
      throw new BusinessError(BusinessErrorCode.NotFound);
    }
    return config;
  }

  static async create(dto: z.infer<typeof SystemConfigCreateZod>) {
    const exist = await this.repo.findOne({ where: { key: dto.key } });

    if (exist) {
      throw new BusinessError(BusinessErrorCode.SystemConfigKeyAlreadyExists);
    }

    const config = this.repo.create(dto);
    return await this.repo.save(config);
  }

  static async update(id: number, dto: z.infer<typeof SystemConfigUpdateZod>) {
    const config = await this.findById(id);

    if (config.buildIn) {
      throw new BusinessError(BusinessErrorCode.Forbidden);
    }

    this.repo.merge(config, pick(dto, ["name", "value", "note"]));
    return await this.repo.save(config);
  }

  static async delete(id: number) {
    const config = await this.findById(id);

    if (config.buildIn) {
      throw new BusinessError(
        BusinessErrorCode.SystemConfigBuildInCanNotDelelte,
      );
    }

    await this.repo.remove(config);
  }
}
