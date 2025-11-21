import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';
import { Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

interface AuditService {
  ping(data: any): any;
}

@Controller('health')
@ApiTags('health')
export class HealthController {
  private auditService: AuditService;

  constructor(
    private health: HealthCheckService,
    private db: SequelizeHealthIndicator,
    @Inject('AUDIT_SERVICE') private auditClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.auditService = this.auditClient.getService<AuditService>('AuditService');
  }

  @Get('live')
  @HealthCheck()
  @ApiOkResponse({ description: 'Liveness probe' })
  checkLive() {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOkResponse({ description: 'Readiness probe with DB and audit-service checks' })
  async checkReady() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      async () => {
        try {
          await firstValueFrom(this.auditService.ping({}));
          return { auditService: { status: 'up' } };
        } catch (error) {
          return { auditService: { status: 'down' } };
        }
      },
    ]);
  }
}
