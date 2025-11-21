import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule,
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'audit',
          protoPath: join(__dirname, '../../../proto/src/audit.proto'),
          url: process.env.AUDIT_SERVICE_URL || 'localhost:50051',
        },
      },
    ]),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
