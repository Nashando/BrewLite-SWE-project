import { ArrayMaxSize, IsArray, IsInt, IsOptional, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @IsInt() productId: number;
  @IsOptional() @IsInt() sizeId?: number;
  @IsOptional() @IsArray() @ArrayMaxSize(5) @IsInt({ each: true }) toppingIds?: number[];
  @IsInt() @Min(1) @Max(20) quantity: number;
}
