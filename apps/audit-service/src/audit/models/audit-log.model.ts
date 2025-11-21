import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

export enum AuditLogAction {
  UserCreated = 'user_created',
  UserUpdated = 'user_updated',
  UserDeleted = 'user_deleted',
}

export enum AuditLogEntityType {
  User = 1,
}

@Table({
  tableName: 'audit_logs',
  timestamps: true,
})
export class AuditLog extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  action: string;

  @Column({
    type: DataType.SMALLINT,
    allowNull: false,
  })
  entity_type: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  entity_id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  request_id: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  timestamp: Date;

  @CreatedAt
  @Column({
    field: 'created_at',
  })
  createdAt: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
  })
  updatedAt: Date;
}
