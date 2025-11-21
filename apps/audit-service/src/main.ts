import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create hybrid application (HTTP + gRPC)
  const app = await NestFactory.create(AppModule);

  // Connect gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'audit',
      protoPath: join(__dirname, '../../proto/src/audit.proto'),
      url: `0.0.0.0:${process.env.GRPC_PORT || 50051}`,
    },
  });

  await app.startAllMicroservices();

  // Start HTTP server for debug endpoints
  const httpPort = process.env.HTTP_PORT || 3001;
  await app.listen(httpPort);
  
  console.log(`Audit Service HTTP is running on: http://localhost:${httpPort}`);
  console.log(`Audit Service gRPC is running on: localhost:${process.env.GRPC_PORT || 50051}`);
}
bootstrap();
