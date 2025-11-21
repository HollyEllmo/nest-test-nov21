"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
var getDatabaseConfig = function (configService) { return ({
    dialect: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: parseInt(configService.get('DB_PORT', '5433'), 10),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: String(configService.get('DB_PASSWORD', 'postgres')),
    database: configService.get('DB_DATABASE'),
    autoLoadModels: true,
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development' ? console.log : false,
}); };
exports.getDatabaseConfig = getDatabaseConfig;
