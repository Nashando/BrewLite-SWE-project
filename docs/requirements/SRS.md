# SRS rút gọn - BrewLite

## 1. Yêu cầu chức năng (FR)

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận (Acceptance Criteria) |
|---|---|---|---|
| FR-01 | Xem menu | Must | Hiển thị danh sách món có tên, giá. Trang tải thành công dưới 2s. |
| FR-02 | Xem chi tiết sản phẩm | Must | Hiển thị mô tả, size, topping. Bấm chọn size/topping cập nhật giá lập tức. |
| FR-03 | Giỏ hàng | Must | Thêm/sửa/xoá món thành công. Tổng tiền cập nhật đúng khi thay đổi số lượng. |
| FR-04 | Đăng ký / Đăng nhập | Must | Tạo tài khoản hợp lệ. Đăng nhập bằng JWT, trả về access token. Báo lỗi nếu sai mật khẩu. |
| FR-05 | Đặt đơn + Thanh toán | Must | Tạo đơn thành công, thanh toán mô phỏng (Ví/Thẻ + Tiền mặt), không âm tồn kho. Hỗ trợ Idempotency. |
| FR-06 | Lịch sử đơn | Should | Xem danh sách đơn đã đặt, trạng thái đơn hiển thị chính xác. |
| FR-07 | Quản lý trạng thái đơn | Should | (Staff/Admin) Cập nhật trạng thái đơn: PENDING_PAYMENT -> PAID -> PREPARING -> READY -> COMPLETED. |
| FR-08 | Quản lý menu & Tồn kho | Could | (Admin) Thêm/sửa/xóa món. Cập nhật số lượng tồn kho, không cho âm kho. |
| FR-09 | Hủy đơn hàng | Should | Khách hàng có thể hủy đơn khi đơn đang ở trạng thái "Chờ xử lý" (PENDING_PAYMENT/PAID). Hoàn kho. |

## 2. Yêu cầu phi chức năng (NFR)

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
|---|---|---|---|
| NFR-01 | Hiệu năng | Should | Trang menu tải dưới 2 giây. |
| NFR-02 | Bảo mật | Must | Mật khẩu mã hoá, JWT hết hạn theo cấu hình. |
| NFR-03 | Khả dụng | Should | Chạy tốt trên giao diện điện thoại, màn hình nhỏ (PWA). |
| NFR-04 | Triển khai | Must | Có URL production truy cập được qua HTTPS. |
| NFR-05 | Health check | Must | Cung cấp phản hồi trạng thái của máy chủ và kết nối CSDL qua API `/health`. |

## 3. Mức ưu tiên MoSCoW
- **Must:** FR-01, FR-02, FR-03, FR-04, FR-05, NFR-02, NFR-04, NFR-05
- **Should:** FR-06, FR-07, FR-09, NFR-01, NFR-03
- **Could:** FR-08
- **Won't:** Giao hàng tận nơi, thanh toán thật qua MOMO/VNPAY, Tích điểm, Khuyến mãi.

## 4. Sơ đồ use-case tổng quát
[Xem chi tiết sơ đồ Use-case tại đây](../diagrams/usecase.svg)
