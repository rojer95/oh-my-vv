import { Column, Entity } from "typeorm";
import { BaseEntitySoftDelete } from "../../lib/base.entity";

@Entity()
export class SystemTenant extends BaseEntitySoftDelete {
  @Column()
  name: string;

  @Column()
  sort: number;

  @Column()
  active: boolean;
}
