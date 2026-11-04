import { IsOptional, IsString } from 'class-validator';

export class ListProductsDto {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() search?: string;
}
