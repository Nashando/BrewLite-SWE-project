import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsIn, IsUUID, ValidateIf } from 'class-validator';

export const SIMULATED_RESULTS = ['SUCCESS', 'FAILED'] as const;
export type SimulatedResult = (typeof SIMULATED_RESULTS)[number];

export class PayDto {
  @IsUUID() orderId: string;
  @IsEnum(PaymentMethod) method: PaymentMethod;

  /** Kết quả khách chọn trên màn hình cổng giả lập (MOMO, VNPAY). CASH không cần vì thu tại quầy. */
  @ValidateIf((o) => o.method !== PaymentMethod.CASH)
  @IsIn(SIMULATED_RESULTS, { message: 'Thiếu kết quả từ cổng thanh toán mô phỏng' })
  simulate?: SimulatedResult;
}
