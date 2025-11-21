import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
} from 'class-validator';

export const AUDIT_ACTIONS = ['user_created', 'user_updated', 'user_deleted'] as const;

export class QueryAuditLogsDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({ default: 50, maximum: 200 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(200)
  @IsOptional()
  limit = 50;

  @ApiPropertyOptional({ description: 'Filter by entity_type' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entity_type?: number;

  @ApiPropertyOptional({ enum: AUDIT_ACTIONS, description: 'Filter by action' })
  @IsOptional()
  @IsIn(AUDIT_ACTIONS as unknown as string[])
  action?: (typeof AUDIT_ACTIONS)[number];

  @ApiPropertyOptional({ description: 'Timestamp from (ISO datetime)' })
  @IsOptional()
  @IsDateString()
  timestamp_from?: string;

  @ApiPropertyOptional({ description: 'Timestamp to (ISO datetime)' })
  @IsOptional()
  @IsDateString()
  timestamp_to?: string;
}
