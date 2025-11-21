import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditLog } from './models/audit-log.model';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog)
    private auditLogModel: typeof AuditLog,
  ) {}

  async logAction(data: {
    action: string;
    entity_type: number;
    entity_id: string;
    request_id: string;
    timestamp: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      await this.auditLogModel.create({
        action: data.action,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        request_id: data.request_id,
        timestamp: new Date(data.timestamp),
      } as any);

      return { success: true, message: 'Audit log created' };
    } catch (error) {
      console.error('Error creating audit log:', error);
      return { success: false, message: 'Failed to create audit log' };
    }
  }

  async ping(): Promise<{ message: string }> {
    return { message: 'pong' };
  }

  async findAll(filters?: any): Promise<AuditLog[]> {
    // Basic implementation for debug endpoint
    return this.auditLogModel.findAll({
      limit: filters?.limit || 100,
      order: [['created_at', 'DESC']],
    });
  }
}
