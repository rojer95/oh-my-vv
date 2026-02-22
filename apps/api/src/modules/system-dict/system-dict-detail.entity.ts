import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../../lib/base.entity";
import { SystemDict } from "./system-dict.entity";

// 数据字典详情
@Entity()
export class SystemDictDetail extends BaseEntity {
  // 字典ID
  @Column()
  systemDictId: number;

  // 名称
  @Column({ length: 128 })
  name: string;

  // 键值
  @Column({ length: 128 })
  key: string;

  // 启用
  @Column({ default: true })
  active: boolean;

  // 排序
  @Column()
  sort: number;

  // 备注
  @Column({ length: 512, nullable: true })
  note?: string;

  // Tag颜色
  @Column({ length: 36, nullable: true })
  color?: string;

  // 样式
  @Column({ length: 512, nullable: true })
  style?: string;

  @ManyToOne(() => SystemDict, (dict) => dict.details)
  dict: SystemDict;
}
