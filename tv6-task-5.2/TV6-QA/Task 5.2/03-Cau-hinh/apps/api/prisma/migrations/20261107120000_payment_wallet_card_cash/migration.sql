-- Đề bài yêu cầu thanh toán Ví/Thẻ mô phỏng: đổi lại phương thức thành WALLET, CARD, giữ CASH làm phần mở rộng.
-- Giao dịch cũ đều là dữ liệu mô phỏng: MOMO chuyển thành WALLET, VNPAY chuyển thành CARD.

-- AlterEnum
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
CREATE TYPE "PaymentMethod" AS ENUM ('WALLET', 'CARD', 'CASH');
ALTER TABLE "Payment"
  ALTER COLUMN "method" TYPE "PaymentMethod"
  USING (CASE "method"::text WHEN 'MOMO' THEN 'WALLET' WHEN 'VNPAY' THEN 'CARD' ELSE 'CASH' END)::"PaymentMethod";
DROP TYPE "PaymentMethod_old";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "cardLast4" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "walletBalance" INTEGER NOT NULL DEFAULT 500000;
