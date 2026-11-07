-- Đổi phương thức thanh toán sang MOMO, VNPAY, CASH theo sơ đồ lớp; thêm trạng thái chờ thu tiền mặt.
-- Giao dịch cũ đều là dữ liệu mô phỏng: WALLET chuyển thành MOMO, CARD chuyển thành VNPAY.

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PENDING' BEFORE 'SUCCESS';

-- AlterEnum
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
CREATE TYPE "PaymentMethod" AS ENUM ('MOMO', 'VNPAY', 'CASH');
ALTER TABLE "Payment"
  ALTER COLUMN "method" TYPE "PaymentMethod"
  USING (CASE "method"::text WHEN 'WALLET' THEN 'MOMO' WHEN 'CARD' THEN 'VNPAY' END)::"PaymentMethod";
DROP TYPE "PaymentMethod_old";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "cardLast4";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "walletBalance";
