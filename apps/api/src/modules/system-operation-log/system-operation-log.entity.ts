import { Column, Entity } from "typeorm";
import { BaseEntityWithTenant } from "../../lib/base.entity";

@Entity("system_operation_log")
export class SystemOperationLog extends BaseEntityWithTenant {
  @Column()
  operatorId: number;

  @Column()
  operatorAccount: string;

  @Column()
  operatorName: string;

  @Column()
  permissionKey: string;

  @Column()
  permissionName: string;

  @Column()
  method: string;

  @Column()
  path: string;

  @Column()
  ip: string;

  @Column("jsonb")
  requestData: {
    query?: Record<string, any>;
    params?: Record<string, any>;
    body?: Record<string, any>;
  };

  @Column({ default: true })
  success: boolean;

  @Column({ nullable: true })
  errorMessage?: string;
}
