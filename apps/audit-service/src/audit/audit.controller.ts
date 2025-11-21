import { Controller, Get } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @GrpcMethod('AuditService', 'LogAction')
  async logAction(data: {
    action: string;
    entity_type: number;
    entity_id: string;
    request_id: string;
    timestamp: string;
  }) {
    return this.auditService.logAction(data);
  }

  @GrpcMethod('AuditService', 'Ping')
  async ping() {
    return this.auditService.ping();
  }

  // HTTP debug endpoint
  @Get('logs')
  async getLogs() {
    return this.auditService.findAll();
  }
}
