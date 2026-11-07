import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export const REVENUE_RANGES = [1, 7, 30] as const;

export class RevenueQueryDto {
  /** Số ngày tính cả hôm nay. */
  @IsOptional() @Type(() => Number) @IsIn(REVENUE_RANGES) days?: number;
}
