import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export class CheckoutDto {
  @IsEnum(PaymentMethod) method: PaymentMethod;

  @ValidateIf((o) => o.method === PaymentMethod.CARD)
  @Matches(/^\d{13,19}$/, { message: 'Số thẻ phải gồm 13–19 chữ số' })
  cardNumber?: string;

  @IsOptional() @IsString() @MaxLength(200) note?: string;
}
