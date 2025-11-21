import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): SequelizeModuleOptions => ({
  dialect: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: parseInt(configService.get<string>('DB_PORT', '5433'), 10),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: String(configService.get<string>('DB_PASSWORD', 'postgres')),
  database: configService.get<string>('DB_DATABASE'),
  autoLoadModels: true,
  // Schema managed via migrations
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development' ? console.log : false,
});
