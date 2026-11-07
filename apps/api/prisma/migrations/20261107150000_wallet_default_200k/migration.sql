-- Ví mô phỏng của tài khoản mới có sẵn 200.000đ. Số dư của tài khoản đã có không đổi.

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "walletBalance" SET DEFAULT 200000;
