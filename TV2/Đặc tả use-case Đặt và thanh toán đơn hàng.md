# Đặc tả Use-Case: Đặt và thanh toán đơn hàng (UC-CHECKOUT)

## 1. Thông tin tổng quan
* **Mã Use-Case:** UC-CHECKOUT
* **Tên Use-Case:** Đặt và thanh toán đơn hàng
* **Tác nhân chính:** Khách hàng (Customer)
* **Yêu cầu liên quan:** FR-03, FR-04, FR-05, NFR-02

## 2. Mô tả ngắn
Cho phép người dùng kiểm tra các món đã thêm vào giỏ, nhập thông tin giao hàng/nhận hàng, chọn phương thức thanh toán mô phỏng và hoàn tất đặt hàng. Hệ thống sẽ kiểm tra tồn kho, trừ số lượng và lưu thông tin đơn hàng.

## 3. Tiền điều kiện (Preconditions)
1. Khách hàng đã đăng nhập tài khoản hợp lệ (JWT active).
2. Giỏ hàng có ít nhất 01 sản phẩm hợp lệ.

## 4. Hậu điều kiện (Postconditions)
1. Đơn hàng được tạo mới trong hệ thống với trạng thái "Chờ xử lý" (PENDING).
2. Tồn kho của các sản phẩm trong đơn được trừ tương ứng.
3. Giỏ hàng hiện tại của khách hàng được xoá/làm rỗng.

## 5. Luồng sự kiện chính (Main Flow)
1. Khách hàng nhấn nút **"Thanh toán"** từ giao diện Giỏ hàng.
2. Hệ thống kiểm tra số lượng tồn kho thực tế của từng món trong giỏ.
3. Hệ thống hiển thị màn hình thanh toán gồm: Danh sách món, Tổng tiền, Thông tin giao hàng và Phương thức thanh toán mô phỏng.
4. Khách hàng xác nhận thông tin nhận hàng và nhấn **"Xác nhận đặt hàng"**.
5. Hệ thống gọi dịch vụ thanh toán mô phỏng để xử lý.
6. Thanh toán thành công, hệ thống:
   - Lưu thông tin đơn hàng vào CSDL.
   - Trừ số lượng tồn kho sản phẩm.
   - Xoá sản phẩm khỏi giỏ hàng.
7. Hệ thống hiển thị thông báo **"Đặt hàng thành công"** kèm Mã đơn hàng và cập nhật trạng thái đơn thành "Chờ".

## 6. Luồng ngoại lệ / Thay thế (Alternative / Exception Flows)

### 6.1. Hết hàng / Không đủ tồn kho (Tại bước 2)
1a. Hệ thống phát hiện có sản phẩm trong giỏ bị hết hàng hoặc vượt quá số lượng tồn.
2a. Hệ thống hiển thị thông báo lỗi: *"Sản phẩm [Tên sản phẩm] không đủ số lượng tồn kho."*
3a. Hệ thống hủy quá trình thanh toán và giữ người dùng ở lại giao diện Giỏ hàng để điều chỉnh.

### 6.2. Thanh toán mô phỏng thất bại (Tại bước 5)
1b. Dịch vụ thanh toán trả về lỗi (mô phỏng tài khoản không đủ tiền / lỗi mạng).
2b. Hệ thống hiển thị thông báo *"Thanh toán thất bại, vui lòng thử lại."*
3b. Đơn hàng không được tạo, tồn kho không thay đổi.