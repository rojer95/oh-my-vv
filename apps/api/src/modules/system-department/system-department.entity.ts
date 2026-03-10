import { Column, Entity, Tree, TreeChildren, TreeParent } from "typeorm";
import { BaseEntitySoftDeleteWithTenant } from "../../lib/base.entity";

@Entity()
@Tree("materialized-path")
export class SystemDepartment extends BaseEntitySoftDeleteWithTenant {
  @Column()
  name: string;

  @Column({ nullable: true })
  parentId: number | null;

  @Column()
  sort: number;

  @Column()
  active: boolean;

  @TreeChildren()
  children: SystemDepartment[];

  @TreeParent()
  parent: SystemDepartment;

  @Column({
    name: "mpath",
    generated: true,
    generatedType: "STORED",
  })
  path: string;
}
