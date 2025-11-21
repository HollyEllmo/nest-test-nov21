import { Injectable } from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/sequelize';
import { AuditLog } from './models/audit-log.model';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog)
    private auditLogModel: typeof AuditLog,
  ) {}

  async logAction(
    data: {
      action: string;
      entity_type: number;
      entity_id: string;
      request_id: string;
      timestamp: string;
    },
    metadata?: Metadata,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const entityType = data.entity_type;
      const entityId = data.entity_id;
      const requestIdFromData = data.request_id;
      const requestIdMeta = metadata?.get('x-request-id')?.[0] as
        | string
        | undefined;
      const requestId = requestIdFromData || requestIdMeta || uuidv4();

      await this.auditLogModel.create({
        action: data.action,
        entity_type: entityType,
        entity_id: entityId,
        request_id: requestId,
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
