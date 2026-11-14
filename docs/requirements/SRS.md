# SRS rút gọn - BrewLite

## 1. Yêu cầu chức năng (FR)

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận & Hậu điều kiện lỗi |
|---|---|---|---|
| FR-01 | Xem menu | Must | Hiển thị danh sách món. **Lỗi:** Nếu API lỗi, hiển thị màn hình thông báo "Không tải được menu" và nút Thử lại. |
| FR-02 | Xem chi tiết sản phẩm | Must | Hiển thị mô tả, size, topping. **Lỗi:** Nếu sản phẩm không tồn tại, hiển thị trang 404. |
| FR-03 | Giỏ hàng | Must | Thêm/sửa/xoá món thành công. **Lỗi:** Nếu món hết hàng, báo đỏ và không cho thêm vào giỏ. |
| FR-04 | Đăng ký / Đăng nhập | Must | Đăng nhập bằng JWT. **Lỗi:** Sai mật khẩu/tài khoản, báo lỗi "Sai thông tin đăng nhập", giữ nguyên form. |
| FR-05 | Đặt đơn + Thanh toán | Must | Tạo đơn thành công, trừ kho. **Hậu điều kiện lỗi:** Nếu thanh toán thất bại, đơn giữ trạng thái PENDING_PAYMENT, không trừ kho, cho phép thử lại thanh toán. |
| FR-06 | Lịch sử đơn | Should | Xem danh sách đơn đã đặt. **Lỗi:** Chưa đăng nhập thì yêu cầu đăng nhập. |
| FR-07 | Quản lý trạng thái đơn | Should | Cập nhật trạng thái: PENDING_PAYMENT -> PAID -> PREPARING -> READY -> COMPLETED. **Lỗi:** Staff không có quyền sửa đơn của chi nhánh khác. |
| FR-08 | Quản lý món, size, topping, tồn kho | Could | (Admin) Thêm/sửa/xóa món. **Lỗi:** Không cho phép xóa món đang có trong đơn hàng PENDING. |
| FR-09 | Hủy đơn chưa pha chế | Should | Khách hủy đơn khi chưa pha chế. Hoàn kho. **Lỗi:** Đơn đã pha chế (PREPARING) thì từ chối hủy. |
| FR-10 | Áp dụng khuyến mãi, tích điểm | Could | *(Tính năng mở rộng - Chưa hiện thực trong MVP)*. |
| FR-11 | Xem thống kê doanh thu | Could | *(Tính năng mở rộng)* Xem báo cáo doanh thu. |

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
- **Could:** FR-08, FR-10, FR-11
- **Won't:** Giao hàng tận nơi, thanh toán thật qua MOMO/VNPAY.

## 4. Sơ đồ use-case tổng quát
[Xem chi tiết sơ đồ Use-case tại đây](https://github.com/Nashando/BrewLite-SWE-project/blob/main/docs/diagrams/usecase.svg)
