import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'audit',
          protoPath: join(process.cwd(), 'dist/libs/proto/audit.proto'),
          url: process.env.AUDIT_SERVICE_URL || 'localhost:50051',
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
