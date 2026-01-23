import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @CreateDateColumn({
    type: "timestamp",
  })
  createdAt?: string | Date;

  @UpdateDateColumn({
    type: "timestamp",
  })
  updatedAt?: string | Date;
}

export abstract class BaseEntitySoftDelete extends BaseEntity {
  @DeleteDateColumn({
    type: "timestamp",
  })
  deletedAt?: string | Date;
}

export abstract class BaseEntityWithTenant extends BaseEntity {
  @Column()
  tenantId: number;
}

export abstract class BaseEntitySoftDeleteWithTenant extends BaseEntitySoftDelete {
  @Column()
  tenantId: number;
}

export abstract class BaseEntityWithTenantDepartment extends BaseEntityWithTenant {
  @Column()
  departmentId: number;
}

export abstract class BaseEntitySoftDeleteWithTenantDepartment extends BaseEntitySoftDeleteWithTenant {
  @Column()
  departmentId: number;
}
