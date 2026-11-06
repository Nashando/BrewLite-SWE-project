import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID() productId: string;
  @IsOptional() @IsUUID() sizeId?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(5) @IsUUID(undefined, { each: true }) toppingIds?: string[];
  @IsInt() @Min(1) @Max(20) quantity: number;
}
