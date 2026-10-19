# SRS rút gọn - BrewLite

## 1. Yêu cầu chức năng (FR)

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
|---|---|---|---|
| FR-01 | Xem menu | Must | Hiển thị danh sách món có tên, giá, ảnh |
| FR-02 | Xem chi tiết sản phẩm | Must | Hiển thị mô tả, size, topping |
| FR-03 | Giỏ hàng | Must | Thêm/sửa/xoá món, tính tổng tiền |
| FR-04 | Đăng ký / Đăng nhập | Must | Tạo tài khoản, đăng nhập bằng JWT |
| FR-05 | Đặt đơn + Thanh toán | Must | Tạo đơn, thanh toán mô phỏng, không âm tồn kho |
| FR-06 | Lịch sử đơn | Should | Xem danh sách đơn đã đặt |
| FR-07 | Quản lý trạng thái đơn | Should | Cập nhật trạng thái: chờ, đang làm, xong |

## 2. Yêu cầu phi chức năng (NFR)

| Mã | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
|---|---|---|---|
| NFR-01 | Hiệu năng | Should | Trang menu tải dưới 2 giây |
| NFR-02 | Bảo mật | Must | Mật khẩu mã hoá, JWT hết hạn |
| NFR-03 | Khả dụng | Should | Chạy trên điện thoại, màn hình nhỏ |
| NFR-04 | Triển khai | Must | Có URL production truy cập được |

## 3. Mức ưu tiên MoSCoW
- **Must:** FR-01, FR-02, FR-03, FR-04, FR-05, NFR-02, NFR-04
- **Should:** FR-06, FR-07, NFR-01, NFR-03
- **Could:** Tích điểm, khuyến mãi
- **Won't:** Giao hàng, quản lý nhân sự

## 4. Sơ đồ use-case tổng quát
(Sẽ cập nhật sau khi TV2 vẽ xong)
