import { Column, Entity, TreeChildren, TreeParent } from "typeorm";
import { BaseEntitySoftDeleteWithTenant } from "./base.entity";

@Entity()
export class SystemDepartment extends BaseEntitySoftDeleteWithTenant {
  @Column()
  name: string;

  @Column()
  parentId: number;

  @Column()
  sort: number;

  @Column()
  active: boolean;

  @TreeChildren()
  children: SystemDepartment[];

  @TreeParent()
  parent: SystemDepartment;
}
