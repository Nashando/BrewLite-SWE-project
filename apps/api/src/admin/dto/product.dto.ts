import { Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, Max, MaxLength, Min, NotEquals, ValidateNested,
} from 'class-validator';

const MAX_PRICE = 10_000_000;
const MAX_STOCK = 1_000_000;
const imageUrl = { protocols: ['http', 'https'], require_protocol: true };

export class ProductSizeDto {
  /** Có id là sửa size cũ, không có là thêm size mới. */
  @IsOptional() @IsUUID() id?: string;
  @IsString() @IsNotEmpty() @MaxLength(30) name: string;
  @IsInt() @Min(0) @Max(MAX_PRICE) extraPrice: number;
}

export class CreateProductDto {
  @IsString() @IsNotEmpty({ message: 'Vui lòng nhập tên món' }) @MaxLength(100) name: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsString() @IsNotEmpty({ message: 'Vui lòng nhập danh mục' }) @MaxLength(50) category: string;
  @IsInt() @Min(0) @Max(MAX_PRICE) basePrice: number;
  @IsOptional() @IsUrl(imageUrl, { message: 'Ảnh phải là URL http hoặc https' }) imageUrl?: string | null;
  @IsInt() @Min(0) @Max(MAX_STOCK) stock: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsArray() @ArrayMaxSize(10) @ValidateNested({ each: true }) @Type(() => ProductSizeDto) sizes?: ProductSizeDto[];
}

/** Không có `stock`: tồn kho đổi qua AdjustStockDto để không ghi đè số đơn vừa trừ. */
export class UpdateProductDto {
  @IsOptional() @IsString() @IsNotEmpty({ message: 'Vui lòng nhập tên món' }) @MaxLength(100) name?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsString() @IsNotEmpty({ message: 'Vui lòng nhập danh mục' }) @MaxLength(50) category?: string;
  @IsOptional() @IsInt() @Min(0) @Max(MAX_PRICE) basePrice?: number;
  @IsOptional() @IsUrl(imageUrl, { message: 'Ảnh phải là URL http hoặc https' }) imageUrl?: string | null;
  @IsOptional() @IsBoolean() isActive?: boolean;
  /** Có gửi thì thay toàn bộ danh sách size: size vắng mặt sẽ bị xoá. */
  @IsOptional() @IsArray() @ArrayMaxSize(10) @ValidateNested({ each: true }) @Type(() => ProductSizeDto) sizes?: ProductSizeDto[];
}

export class AdjustStockDto {
  /** Số dương là nhập thêm, số âm là giảm bớt. */
  @IsInt() @NotEquals(0, { message: 'Số lượng thay đổi phải khác 0' }) @Min(-MAX_STOCK) @Max(MAX_STOCK) delta: number;
}

export class CreateToppingDto {
  @IsString() @IsNotEmpty({ message: 'Vui lòng nhập tên topping' }) @MaxLength(50) name: string;
  @IsInt() @Min(0) @Max(MAX_PRICE) price: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateToppingDto {
  @IsOptional() @IsString() @IsNotEmpty({ message: 'Vui lòng nhập tên topping' }) @MaxLength(50) name?: string;
  @IsOptional() @IsInt() @Min(0) @Max(MAX_PRICE) price?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
