import { Controller, Get, Query } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Metadata } from '@grpc/grpc-js';
import { AuditService } from './audit.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { LogActionRequest } from '@app/proto/generated/audit';

@Controller('audit')
@ApiTags('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @GrpcMethod('AuditService', 'LogAction')
  async logAction(data: LogActionRequest, metadata: Metadata) {
    return this.auditService.logAction(data, metadata);
  }

  @GrpcMethod('AuditService', 'Ping')
  async ping() {
    return this.auditService.ping();
  }

  // HTTP debug endpoint
  @Get('logs')
  @ApiOkResponse({ description: 'List audit logs with pagination and filters' })
  async getLogs(@Query() query: QueryAuditLogsDto) {
    return this.auditService.findAll(query);
  }
}
