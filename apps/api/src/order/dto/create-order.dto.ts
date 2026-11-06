import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';

export class OrderLineDto {
  @IsUUID() productId: string;
  @IsOptional() @IsUUID() sizeId?: string | null;
  @IsOptional() @IsArray() @ArrayMaxSize(5) @IsUUID(undefined, { each: true }) toppingIds?: string[];
  @IsInt() @Min(1) @Max(20) quantity: number;
}

export class CreateOrderDto {
  /** Danh sách món do frontend gửi. Bỏ trống thì lấy từ giỏ hàng trên server (module Cart). */
  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => OrderLineDto)
  items?: OrderLineDto[];

  @IsOptional() @IsString() @MaxLength(200) note?: string;
}
