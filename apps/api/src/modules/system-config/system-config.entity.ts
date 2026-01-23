import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../lib/base.entity";

@Entity()
export class SystemConfig extends BaseEntity {
  @Column({ length: 128 })
  name: string;

  @Column({ length: 128, unique: true })
  key: string;

  @Column({ length: 1024 })
  value: string;

  @Column({ default: false })
  buildIn: boolean;

  @Column({ length: 512, nullable: true })
  note?: string;
}
