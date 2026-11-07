# BrewLite API (TV5 – Backend)

NestJS 10 + Prisma 5 + PostgreSQL + JWT. Hợp đồng API khớp frontend `apps/web` (TV4).

## Chạy local
```bash
cd apps/api
# tạo apps/api/.env (xem mục Biến môi trường)
npm install
npx prisma migrate dev --name init   # tạo migration + áp dụng (commit thư mục prisma/migrations)
npm run prisma:seed                  # dữ liệu mẫu
npm run start:dev                    # http://localhost:3001
npm test                             # unit + e2e (mock DB, không cần Postgres)
```
Tài khoản seed: `manager@brewlite.vn / Manager@123` (MANAGER), `staff@brewlite.vn / Staff@123` (STAFF), `khach@brewlite.vn / Customer@123` (CUSTOMER).

## Biến môi trường
Bắt buộc: `DATABASE_URL`, `JWT_SECRET`. Tuỳ chọn: `PORT` (mặc định **3001**), `API_PREFIX` (vd `/api/v1`, mặc định không có; `/health` luôn không có tiền tố), `CORS_ORIGIN` (vd `http://localhost:3000`, nhiều origin cách nhau bằng dấu phẩy), `JWT_EXPIRES_IN` (mặc định 1d), `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` (mặc định 7d), `ORDER_PAYMENT_TTL_MINUTES` (mặc định 15).

## Endpoint
Nếu đặt `API_PREFIX=/api/v1` thì mọi đường dẫn dưới đây (trừ `/health`) nằm sau `/api/v1`, và frontend cần `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`.

Xác thực: `Authorization: Bearer <accessToken>`. Mọi `id` là UUID dạng chuỗi. Lỗi trả `{ statusCode, message, path, timestamp }` (có thêm `code` với một số lỗi).

| Method | Đường dẫn | Quyền | Ghi chú |
|---|---|---|---|
| GET | /health | public | Terminus: API + PostgreSQL (503 nếu DB lỗi) |
| GET | /products?category=&search= | public | mảng `{id,name,description,category,basePrice,imageUrl,isAvailable}` |
| GET | /products/:id | public | thêm `sizes[{id,name,extraPrice}]`, `toppings[{id,name,price}]` (bánh: `[]`) |
| POST | /auth/register, /auth/login | public | `{accessToken, refreshToken, user{id,name,email,role}}` |
| POST | /auth/refresh | public | `{refreshToken}` → cặp token mới |
| GET | /auth/me | JWT | thông tin tài khoản, kèm `walletBalance` |
| POST | /orders | JWT | `{items:[{productId,sizeId\|null,toppingIds[],quantity}], note?}` → đơn `PENDING_PAYMENT`, **server tự tính lại giá**, trừ kho. Hết hàng: 400 `code: "OUT_OF_STOCK"`. Bỏ `items` thì lấy từ giỏ trên server |
| POST | /payments | JWT | header `Idempotency-Key` (UUID), body `{orderId, method: WALLET\|CARD\|CASH, card?:{number,expiry,cvv}}` (`card` bắt buộc với CARD). Thành công: 201, đơn `PAID`. Thất bại: 402 `code: "PAYMENT_FAILED"`, đơn `CANCELLED`, trả kho, thử lại phải tạo đơn mới. CASH: 201 giao dịch `PENDING`, đơn chờ nhân viên xác nhận |
| GET | /orders, /orders/:id, /orders/code/:code | JWT | `{id,code,status,total,createdAt,items[{productName,sizeName,toppings:string[],quantity,unitPrice}],payments[]}` |
| POST | /orders/:id/cancel | JWT | huỷ khi chưa pha chế (`PENDING_PAYMENT`/`PAID`); hoàn kho, giao dịch đã trả chuyển `REFUNDED` |
| POST | /orders/:id/confirm-cash | STAFF, MANAGER | xác nhận đã thu tiền mặt: giao dịch `SUCCESS`, đơn `PAID` |
| PATCH | /orders/:id/status | STAFF, MANAGER | PAID→PREPARING→READY→COMPLETED |
| GET | /orders/all | STAFF, MANAGER | tất cả đơn, kèm `customer{name,email}` |
| GET/DELETE | /cart | JWT | giỏ hàng trên server (tuỳ chọn, frontend hiện lưu giỏ ở client) |
| POST | /cart/items | JWT | `{productId, sizeId?, toppingIds?, quantity}` |
| PATCH/DELETE | /cart/items/:id | JWT | |
| GET/POST | /admin/products | MANAGER | danh sách kể cả món ẩn, kèm `stock`, `sizes`; thêm món |
| PATCH | /admin/products/:id | MANAGER | sửa món, ẩn bằng `isActive: false`; gửi `sizes` là thay toàn bộ size |
| POST | /admin/products/:id/stock | MANAGER | `{delta}`: dương là nhập thêm, âm là giảm; không cho âm kho |
| GET/POST | /admin/toppings | MANAGER | danh sách kể cả topping ẩn; thêm topping |
| PATCH | /admin/toppings/:id | MANAGER | sửa, ẩn topping |
| GET | /admin/reports/revenue?days=1\|7\|30 | MANAGER | `{revenue,orderCount,averageOrder,daily[{date,revenue,orders}],topProducts[{productId,name,quantity,revenue}]}`, tính theo giờ Việt Nam, không tính đơn huỷ và đơn chưa trả |

## Quy tắc nghiệp vụ
- Đơn `PENDING_PAYMENT` giữ hàng tối đa 15 phút; quá hạn tự huỷ và trả lại tồn kho.
- Giả lập thanh toán, không nối cổng thật: ví mặc định 200.000đ (thiếu ⇒ thất bại). Thẻ bắt đầu `4000` hoặc kết thúc `0002` bị từ chối, kết thúc `0003` mô phỏng timeout, thẻ khác thành công; chỉ lưu 4 số cuối.
- Phần mở rộng: CASH trả tại quầy, quá hạn giữ hàng mà chưa thu thì đơn tự huỷ.
- Trạng thái đơn: `PENDING_PAYMENT` → `PAID` → `PREPARING` → `READY` → `COMPLETED`; hoặc `CANCELLED`.
- Size: S / M / L. Danh mục: Cà phê, Trà, Freeze, Bánh.

## Docker
`docker compose up --build` ở thư mục gốc repo dùng `apps/api/Dockerfile` (cần `package-lock.json`). Container tự chạy `prisma migrate deploy` khi khởi động. Nạp dữ liệu mẫu: chạy `npm run prisma:seed` trên máy host với `DATABASE_URL` trỏ `localhost:5432`.
