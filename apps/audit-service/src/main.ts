import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // Load .env before Nest app bootstraps (works in dev and after build)
  dotenv.config({ path: resolve(process.cwd(), 'apps/audit-service/.env') });

  // Create hybrid application (HTTP + gRPC)
  const app = await NestFactory.create(AppModule);

  // Connect gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'audit',
      protoPath: join(process.cwd(), 'dist/libs/proto/audit.proto'),
      url: `0.0.0.0:${process.env.GRPC_PORT || 50051}`,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  // Start gRPC server
  await app.startAllMicroservices();

  // Start HTTP server for debug endpoints
  const httpPort = process.env.HTTP_PORT || 3001;
  await app.listen(httpPort);

  console.log(`Audit Service HTTP is running on: http://localhost:${httpPort}`);
  console.log(
    `Audit Service gRPC is running on: localhost:${process.env.GRPC_PORT || 50051}`,
  );
}
bootstrap();
