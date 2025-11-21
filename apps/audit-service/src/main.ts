import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config({ path: resolve(process.cwd(), 'apps/audit-service/.env') });

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'audit',
      protoPath: join(process.cwd(), 'dist/libs/proto/audit.proto'),
      url: `0.0.0.0:${process.env.GRPC_PORT || 50051}`,
    },
  });

  await app.startAllMicroservices();

  const httpPort = process.env.HTTP_PORT || 3001;
  await app.listen(httpPort);

  console.log(`Audit Service HTTP is running on: http://localhost:${httpPort}`);
  console.log(
    `Audit Service gRPC is running on: localhost:${process.env.GRPC_PORT || 50051}`,
  );
}
bootstrap();
