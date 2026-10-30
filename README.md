# BrewLite API (TV5 – Backend)

NestJS 10 + Prisma 5 + PostgreSQL + JWT.

## Chạy local
```bash
cd apps/api
cp ../../.env.example .env      # sửa DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev --name init   # tạo migration + áp dụng (commit thư mục prisma/migrations)
npm run prisma:seed                  # dữ liệu mẫu
npm run start:dev
npm test                             # unit + e2e (mock DB, không cần Postgres)
```
Tài khoản seed: `manager@brewlite.vn / Manager@123` (MANAGER), `staff@brewlite.vn / Staff@123` (STAFF), `khach@brewlite.vn / Customer@123` (CUSTOMER).

## Endpoint
| Method | Đường dẫn | Quyền | Ghi chú |
|---|---|---|---|
| GET | /health | public | NestJS Terminus, kiểm tra API + PostgreSQL (503 nếu DB lỗi) |
| GET | /products?category=&search=&page=&limit= | public | phân trang |
| GET | /products/:id, /products/toppings | public | |
| POST | /auth/register, /auth/login | public | trả `accessToken` (15 phút) + `refreshToken` (7 ngày) |
| POST | /auth/refresh | public | `{refreshToken}` → cặp token mới |
| GET | /auth/me | JWT | kèm `walletBalance` |
| GET/DELETE | /cart | JWT | |
| POST | /cart/items | JWT | `{productId, sizeId?, toppingIds?, quantity}` |
| PATCH/DELETE | /cart/items/:id | JWT | |
| POST | /order/checkout | JWT | **đặt hàng + thanh toán 1 bước**. Header `Idempotency-Key` (UUID), body `{method: WALLET\|CARD, cardNumber?, note?}`. Thất bại ⇒ không tạo đơn, tồn kho giữ nguyên |
| GET | /orders, /orders/:id, /orders/code/:code | JWT | lịch sử / chi tiết / tra cứu theo mã `BL-XXXXXXXX` |
| POST | /orders/:id/cancel | JWT | huỷ khi đơn còn `PENDING`; hoàn kho, hoàn tiền |
| PATCH | /orders/:id/status | STAFF, MANAGER | PENDING→PREPARING→READY→COMPLETED |
| GET | /orders/all | STAFF, MANAGER | tất cả đơn |

Header xác thực: `Authorization: Bearer <accessToken>`.
Mỗi giao dịch có `transactionRef` (mã ngẫu nhiên). Size: Tall / Grande / Venti. Danh mục: Cà phê, Trà, Freeze, Bánh.
Giả lập thanh toán: ví mặc định 500.000đ (thiếu tiền ⇒ 402); thẻ kết thúc `0002` bị từ chối (402), kết thúc `0003` mô phỏng timeout (402), thẻ khác thành công.
Trạng thái đơn: `PENDING` (đã thanh toán, chờ quầy) → `PREPARING` → `READY` → `COMPLETED`; hoặc `CANCELLED`.
Lỗi trả dạng `{ statusCode, message, path, timestamp }`.

## Biến môi trường
`DATABASE_URL`, `JWT_SECRET` (bắt buộc), `PORT`. Tuỳ chọn: `JWT_EXPIRES_IN` (mặc định 15m), `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` (mặc định 7d).
Production/Docker: `npm run build` rồi `npm run start:migrate` (chạy `prisma migrate deploy` trước khi khởi động).
