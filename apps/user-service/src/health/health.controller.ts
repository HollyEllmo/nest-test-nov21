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

interface AuditService {
  ping(data: any): any;
}

@Controller('health')
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
  checkLive() {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
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
