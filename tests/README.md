# Integration và end-to-end test

Các test này chạy trên hệ thống thật (web, API, PostgreSQL), không dùng mock. Unit test nằm trong `apps/api` và `apps/web`.

| Mã | Tệp | Kiểm tra |
|---|---|---|
| INT-T01 | `integration/auth.test.mjs` | Đăng ký, đăng nhập, JWT |
| INT-T02 | `integration/orders.test.mjs` | Tạo đơn, tính giá ở server, tồn kho, hết hàng, đặt đồng thời |
| INT-T03 | `integration/payments.test.mjs` | Ví, thẻ, thất bại, idempotency, thanh toán đồng thời |
| INT-T04 | `integration/cash-cancel.test.mjs` | Tiền mặt tại quầy, huỷ đơn, hoàn tiền, đơn hết hạn |
| INT-T05 | `integration/staff-admin.test.mjs` | Trạng thái đơn, phân quyền, quản lý món, doanh thu |
| E2E-T01 | `e2e/checkout.spec.mjs` | Từ menu đến xác nhận đơn bằng ví, gồm trường hợp chưa đăng nhập |
| E2E-T02 | `e2e/checkout.spec.mjs` | Thẻ bị từ chối rồi thử lại |
| E2E-T03 | `e2e/checkout.spec.mjs` | Món hết hàng khi thanh toán |
| E2E-T06 | `e2e/checkout.spec.mjs` | Giỏ còn món cũ hoặc giá đã đổi được tự cập nhật |
| E2E-T04 | `e2e/staff.spec.mjs` | Trả tiền mặt, quầy xác nhận và xử lý đơn, khách thấy trạng thái mới |
| E2E-T05 | `e2e/admin.spec.mjs` | Quản lý thêm món, món lên menu, xem doanh thu |

## Cách chạy

```bash
# 1. Chạy hệ thống và nạp dữ liệu mẫu (cần tài khoản seed)
docker compose up --build -d
(cd apps/api && npm ci && DATABASE_URL=postgresql://brewlite:brewlite@localhost:5432/brewlite npm run prisma:seed)

# 2. Chạy test
cd tests
npm ci
npx playwright install chromium
npm test                 # hoặc test:integration, test:e2e
```

Mặc định trỏ tới hệ thống local. Đổi bằng biến môi trường `API_URL`, `WEB_URL`, `DATABASE_URL`. Test tự tạo tài khoản và món riêng, xong thì ẩn món đó, nên chạy lại nhiều lần được; các test chạy tuần tự vì có phép so sánh tổng doanh thu. Riêng `DATABASE_URL` chỉ dùng để giả lập đơn quá hạn; **không chạy các test này trên production**.
