# Release Notes

> Mỗi phiên bản ứng với một git tag `vX.Y.Z` trên nhánh `main` và một GitHub Release. Phiên bản mới nhất nằm ở trên cùng.

## v1.0.0 — 2026-11-07

Phiên bản đầu tiên chạy được toàn bộ luồng: **Xem menu ➔ Chọn tuỳ chọn ➔ Giỏ hàng ➔ Đặt đơn ➔ Thanh toán ➔ Theo dõi đơn**.

**Truy cập**
- Web: `https://brewlite-swe-project-web.vercel.app`
- API: `https://brewlite-swe-project.onrender.com` (health check: `https://brewlite-swe-project.onrender.com/health`)
- Image: `ghcr.io/nashando/brewlite-api:1.0.0`

### Tính năng
- **Menu và chi tiết sản phẩm:** danh sách đồ uống theo danh mục, tìm kiếm, chọn size (S / M / L) và topping; trạng thái loading, empty, error.
- **Giỏ hàng:** thêm/sửa/xoá món, tính tổng tiền; máy chủ luôn tính lại giá khi đặt đơn.
- **Tài khoản:** đăng ký, đăng nhập, JWT (access token và refresh token), phân quyền khách / nhân viên / quản lý.
- **Đặt đơn:** tạo đơn trong một transaction, trừ tồn kho; báo hết hàng; đơn chờ thanh toán giữ hàng 15 phút rồi tự huỷ và hoàn tồn kho.
- **Thanh toán mô phỏng:** Ví và Thẻ, có `Idempotency-Key` để gửi lại không bị trừ tiền hai lần; thanh toán thất bại sẽ tự động hủy đơn và hoàn trả tồn kho, khách hàng cần tạo đơn mới để thử lại.
- **Theo dõi đơn:** lịch sử đơn, chi tiết đơn, tra cứu theo mã đơn, huỷ đơn (hoàn kho và hoàn tiền nếu đã thanh toán).
- **Quản lý đơn (API):** nhân viên/quản lý xem tất cả đơn và chuyển trạng thái PAID ➔ PREPARING ➔ READY ➔ COMPLETED.
- **Vận hành:** `GET /health` (kiểm tra cả PostgreSQL), logging, cấu hình qua biến môi trường, `docker-compose.yml` chạy web + API + database ở local.
- **CI/CD:** GitHub Actions chạy Install ➔ Lint ➔ Test ➔ Build cho mọi PR; push tag kích hoạt Render Deploy Hook và chạy Smoke Test xác thực API (`/health`, `/products`) và Web (`/menu`).

### Hạn chế đã biết
- Thanh toán là **mô phỏng**, không có cổng thanh toán thật (ADR 004).
- Chưa có giao diện riêng cho nhân viên quầy và chưa có thông báo thời gian thực (WebSocket); nhân viên thao tác qua API.
- Chưa có khuyến mãi (Promotion) và tích điểm (Loyalty).
- Hạ tầng gói miễn phí: API có thể mất khoảng 1 phút để khởi động lại sau thời gian không có truy cập; cơ sở dữ liệu miễn phí của Render có thời hạn 30 ngày.
- Dữ liệu mẫu không tự nạp trên production.
- Đã hoàn tất kiểm thử tích hợp (integration test) và kiểm thử luồng chính (E2E test) ở môi trường local/staging.

### Thay đổi cấu hình
- Biến môi trường bắt buộc khi chạy production: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` (xem `docs/deployment.md`).

### Nâng cấp / Rollback
- Migration chạy tự động khi API khởi động (`prisma migrate deploy`), không có thay đổi phá vỡ.
- Rollback: xem mục 5 trong `docs/deployment.md`.