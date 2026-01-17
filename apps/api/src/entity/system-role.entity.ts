import { RoleDataPermType } from "@rojer/mf-common";
import { Column, Entity } from "typeorm";
import { BaseEntitySoftDeleteWithTenant } from "./base.entity";
@Entity()
export class SystemRole extends BaseEntitySoftDeleteWithTenant {
  @Column()
  name: string;

  @Column()
  sort: number;

  @Column()
  active: boolean;

  @Column("jsonb")
  menuPerm: string[];

  @Column({ type: "enum", enum: RoleDataPermType })
  dataPermType: RoleDataPermType;

  @Column("jsonb")
  department: number[];
}
