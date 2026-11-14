# SRS rút gọn - BrewLite

## 1. Yêu cầu chức năng (FR)

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận & Hậu điều kiện lỗi |
|---|---|---|---|
| FR-01 | Xem menu và tìm kiếm món | Must | Hiển thị danh sách món. Có thanh tìm kiếm theo tên. **Lỗi:** Nếu API lỗi, hiển thị màn hình thông báo "Không tải được menu" và nút Thử lại. |
| FR-02 | Xem chi tiết sản phẩm | Must | Hiển thị mô tả, size, topping. **Lỗi:** Nếu sản phẩm không tồn tại, hiển thị trang 404. |
| FR-03 | Giỏ hàng | Must | Thêm/sửa/xoá món thành công. **Lỗi:** Nếu món hết hàng, báo đỏ và không cho thêm vào giỏ. |
| FR-04 | Đăng ký / Đăng nhập | Must | Đăng nhập bằng JWT. **Lỗi:** Sai mật khẩu/tài khoản, báo lỗi "Sai thông tin đăng nhập", giữ nguyên form. |
| FR-05 | Đặt đơn + Thanh toán | Must | Tạo đơn thành công, trừ kho. **Hậu điều kiện lỗi:** Nếu thanh toán thất bại, đơn giữ trạng thái PENDING_PAYMENT, không trừ kho, cho phép thử lại thanh toán. |
| FR-06 | Lịch sử đơn | Should | Xem danh sách đơn đã đặt. **Lỗi:** Chưa đăng nhập thì yêu cầu đăng nhập. |
| FR-07 | Quản lý trạng thái đơn | Should | (Staff/Admin) Cập nhật trạng thái từ PAID -> PREPARING -> READY -> COMPLETED qua PATCH `/orders/:id/status`. (Chuyển PENDING_PAYMENT -> PAID do thanh toán hoặc xác nhận tiền mặt qua `/confirm-cash`). **Lỗi:** Không được chuyển trực tiếp từ PENDING_PAYMENT sang PREPARING. |
| FR-08 | Hủy đơn chưa pha chế | Should | Khách hủy đơn khi đang ở trạng thái PENDING_PAYMENT hoặc PAID. Hoàn kho và hoàn tiền ví (nếu đã thanh toán). **Lỗi:** Đơn đã ở PREPARING thì từ chối hủy. |
| FR-09 | Tìm kiếm món | Should | *(Gộp chung vào FR-01, cho phép lọc theo từ khóa, danh mục)*. |
| FR-10 | Quản lý menu & Tồn kho | Could | (Admin) Thêm/sửa/xóa món, size, topping. Cập nhật tồn kho. **Lỗi:** Không cho phép xóa món đang có trong đơn hàng PENDING. |
| FR-11 | Xem thống kê doanh thu | Could | (Admin) Xem báo cáo doanh thu, số lượng đơn, món bán chạy. |

## 2. Yêu cầu phi chức năng (NFR)
| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
|---|---|---|---|
| NFR-01 | Hiệu năng | Should | Trang menu tải dưới 2 giây (đo bằng Lighthouse/Network tab). |
| NFR-02 | Bảo mật | Must | Mật khẩu mã hoá, JWT hết hạn theo cấu hình. |
| NFR-03 | Khả dụng | Should | PWA hiển thị tốt trên viewport di động (375px) và desktop (1440px). |
| NFR-04 | Triển khai | Must | Có URL production truy cập được qua HTTPS. |
| NFR-05 | Health check | Must | API `/health` trả về 200 OK và trạng thái DB up. |

## 3. Mức ưu tiên MoSCoW
- **Must:** FR-01, FR-02, FR-03, FR-04, FR-05, NFR-02, NFR-04, NFR-05
- **Should:** FR-06, FR-07, FR-08, NFR-01, NFR-03
- **Could:** FR-10, FR-11
- **Won't:** Giao hàng tận nơi, thanh toán thật qua MOMO/VNPAY.

## 4. Sơ đồ use-case tổng quát
[Xem chi tiết sơ đồ Use-case tại đây]((https://github.com/Nashando/BrewLite-SWE-project/blob/main/docs/diagrams/usecase.svg)
