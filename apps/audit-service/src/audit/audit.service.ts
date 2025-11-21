import { Injectable } from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/sequelize';
import { AuditLog } from './models/audit-log.model';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog)
    private auditLogModel: typeof AuditLog,
  ) {}

  async logAction(
    data: {
      action: string;
      entityType: number;
      entityId: string;
      requestId: string;
      timestamp: string;
    },
    metadata?: Metadata,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const entityType = data.entityType;
      const entityId = data.entityId;
      const requestIdFromData = data.requestId;
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

  async findAll(query: QueryAuditLogsDto): Promise<{
    items: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 50,
      entity_type,
      action,
      timestamp_from,
      timestamp_to,
    } = query;

    const normalizedLimit = Math.min(limit, 200);
    const offset = (page - 1) * normalizedLimit;

    const where: any = {};
    if (entity_type !== undefined) {
      where.entity_type = entity_type;
    }
    if (action) {
      where.action = action;
    }
    if (timestamp_from || timestamp_to) {
      where.timestamp = {};
      if (timestamp_from) where.timestamp[Op.gte] = new Date(timestamp_from);
      if (timestamp_to) where.timestamp[Op.lte] = new Date(timestamp_to);
    }

    const { rows, count } = await this.auditLogModel.findAndCountAll({
      where,
      order: [
        ['timestamp', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: normalizedLimit,
      offset,
    });

    return {
      items: rows,
      total: count,
      page,
      limit: normalizedLimit,
    };
  }
}
