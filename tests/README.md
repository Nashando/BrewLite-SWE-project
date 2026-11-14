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
docker compose exec api npm run seed

# 2. Chạy test
cd tests
npm ci
npx playwright install chromium
npm test                 # hoặc test:integration, test:e2e
```

E2E chạy mỗi kịch bản hai lần: mobile 375×812 (thiết lập touch/scale từ Pixel 7, viewport override theo SRS) và desktop 1440×900. Chạy riêng: `npx playwright test --project=mobile-chromium` hoặc `--project=desktop-chromium`. Kết quả chạy phải ghi phiên bản/patch và môi trường web dev hay production. Bộ QA không tự bao gồm bản sửa UI của thành viên frontend.

Mặc định trỏ tới hệ thống local. Đổi bằng biến môi trường `API_URL`, `WEB_URL`, `DATABASE_URL`. Test tự tạo tài khoản và món riêng, xong thì ẩn món đó, nên chạy lại nhiều lần được; các test chạy tuần tự vì có phép so sánh tổng doanh thu. Riêng `DATABASE_URL` chỉ dùng để giả lập đơn quá hạn; **không chạy các test này trên production**.

## Unit test công cụ QA

Từ tests chạy `npm run test:unit`: 8 test smoke helper, không cần API/DB. `npm test` chạy lần lượt unit QA → integration → E2E. Unit nghiệp vụ ứng dụng vẫn ở apps/api và apps/web theo README gốc; không di chuyển test đã có.

`helpers/smoke.mjs` chỉ gửi GET /health, /products, /menu. Nếu cung cấp EXPECTED_COMMIT thì kiểm thêm /version và /api/version và fail khi lệch SHA. Main chưa có các endpoint này thì bỏ EXPECTED_COMMIT; kết quả ghi commitVerified=false, không giả nhận đã xác minh deployment SHA. Không gọi Deploy Hook hoặc thay cấu hình production.

## Kiểm chứng Compose và lưu log (Windows/PowerShell)

Chạy từ root repo, yêu cầu Docker engine/Compose v2 hỗ trợ up --wait và Node.js 22. Cài dependency trong tests và Chromium trước khi dùng -RunTests:

```powershell
powershell -NoProfile -File tests/scripts/verify-compose.ps1 -OutputDirectory ./compose-evidence -RunTests
```

Script dùng project/ports/password tạm, build web/API, áp dụng migration khi API start, seed, smoke và test; lưu log, rồi chỉ dọn project/volume thử của nó. Không dùng database production. Nếu thiếu Docker thì exit 2/status blocked; không coi schema hợp lệ hoặc test ngoài Docker là Compose đã đạt.

## Đo menu và kiểm tra tràn ngang

Trỏ WEB_URL tới hệ thống local đang chạy; WEB_MODE ghi dev hay production. Từ tests:

```powershell
$env:WEB_URL = 'http://localhost:3000'
$env:WEB_MODE = 'production'
$env:MEASUREMENT_OUTPUT = './menu-measurement.json'
npm run test:measure
```

Script đo 3 LCP ở context mới, viewport 375×812, không throttle, báo từng mẫu/trung vị; kiểm tra menu/chi tiết/giỏ/checkout ở 375×812 và 1440×900, manifest và lưu ảnh. LCP >=2s/tràn ngang/manifest lỗi trả exit 1. Đây là phép đo QA độc lập, không tự sửa UI hoặc khẳng định production cloud đạt. Xem [báo cáo theo phiên bản](../docs/testing/qa-report-2026-11-15.md).
