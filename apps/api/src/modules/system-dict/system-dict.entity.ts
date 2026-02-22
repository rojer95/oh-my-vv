import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../lib/base.entity";
import { SystemDictDetail } from "./system-dict-detail.entity";

// 数据字典
@Entity()
export class SystemDict extends BaseEntity {
  // 名称
  @Column({ length: 128 })
  name: string;

  // 唯一标识
  @Column({ length: 128, unique: true })
  key: string;

  // 启用
  @Column({ default: true })
  active: boolean;

  // 备注
  @Column({ length: 512, nullable: true })
  note: string | null;

  @OneToMany(() => SystemDictDetail, (detail: SystemDictDetail) => detail.dict)
  details: SystemDictDetail[];
}
