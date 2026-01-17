import { Column, Entity } from "typeorm";
import { BaseEntitySoftDeleteWithTenantDepartment } from "./base.entity";

@Entity()
export class SystemAccount extends BaseEntitySoftDeleteWithTenantDepartment {
  @Column()
  account: string;

  @Column()
  originAccount: string;

  @Column()
  accountType: string;

  @Column({ select: false })
  password: string;

  @Column()
  realName: string;

  @Column()
  phone: string;

  @Column()
  mail: string;

  @Column()
  loginCount: number;

  @Column()
  active: boolean;

  @Column()
  isSuper: boolean;

  @Column("jsonb")
  role: number[];

  @Column()
  lastIp: string;

  @Column("timestamp")
  lastTime?: string | Date;

  @Column({ select: false })
  totpSecret?: string;
}
