import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';

export const SORTABLE_FIELDS = ['name', 'email', 'created_at'] as const;
export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

export class QueryUsersDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  @IsOptional()
  limit = 20;

  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: 'created_at' })
  @IsOptional()
  @IsIn(SORTABLE_FIELDS as unknown as string[])
  sort_by: (typeof SORTABLE_FIELDS)[number] = 'created_at';

  @ApiPropertyOptional({ enum: SORT_DIRECTIONS, default: 'asc' })
  @IsOptional()
  @IsIn(SORT_DIRECTIONS as unknown as string[])
  sort_dir: (typeof SORT_DIRECTIONS)[number] = 'asc';

  @ApiPropertyOptional({ description: 'Filter by name (ILIKE)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by email (ILIKE)' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'created_at from (ISO datetime)' })
  @IsOptional()
  @IsDateString()
  created_from?: string;

  @ApiPropertyOptional({ description: 'created_at to (ISO datetime)' })
  @IsOptional()
  @IsDateString()
  created_to?: string;
}
