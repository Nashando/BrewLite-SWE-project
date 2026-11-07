import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';
import { IsDefined, IsEnum, IsString, IsUUID, Matches, ValidateIf, ValidateNested } from 'class-validator';

export class CardDto {
  @IsString() @Matches(/^[\d\s]{13,23}$/, { message: 'Số thẻ không hợp lệ' }) number: string;
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Hạn dùng phải dạng MM/YY' }) expiry: string;
  @Matches(/^\d{3,4}$/, { message: 'CVV gồm 3 hoặc 4 chữ số' }) cvv: string;
}

export class PayDto {
  @IsUUID() orderId: string;
  @IsEnum(PaymentMethod) method: PaymentMethod;

  @ValidateIf((o) => o.method === PaymentMethod.CARD)
  @IsDefined({ message: 'Thiếu thông tin thẻ' })
  @ValidateNested()
  @Type(() => CardDto)
  card?: CardDto;
}
