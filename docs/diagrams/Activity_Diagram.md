@startuml
title Activity Diagram - Luồng End-to-End Đặt và Thanh Toán Đơn Hàng (BrewLite)

|Khách hàng|
start
:Xem danh sách Menu sản phẩm;
:Chọn sản phẩm, tùy chọn (Size, Topping);
:Thêm sản phẩm vào Giỏ hàng;

repeat
:Xem Giỏ hàng & Nhấn nút "Thanh toán";

|Hệ thống (Next.js / NestJS)|
:Kiểm tra trạng thái đăng nhập (JWT);
if (Đã đăng nhập hợp lệ?) then (Chưa đăng nhập)
:Yêu cầu đăng nhập / Chuyển hướng trang Login;
|Khách hàng|
:Nhập thông tin Đăng nhập / Đăng ký;
|Hệ thống (Next.js / NestJS)|
:Xác thực và cấp JWT Token;
else (Đã đăng nhập)
endif

:Kiểm tra số lượng tồn kho của các món trong giỏ;
if (Tồn kho còn đủ?) then (Hết hàng / Không đủ)
:Hiển thị thông báo lỗi "Hết hàng / Không đủ tồn kho";
|Khách hàng|
:Điều chỉnh lại số lượng hoặc xóa món trong Giỏ hàng;
endif
repeat while (Giỏ hàng hợp lệ & Đủ tồn kho?) is (Không)
-> Hợp lệ;

|Hệ thống (Next.js / NestJS)|
:Hiển thị màn hình Xác nhận đơn hàng & Thanh toán;

|Khách hàng|
:Nhập thông tin nhận hàng, chọn Phương thức thanh toán;
:Nhấn "Xác nhận đặt hàng";

|Hệ thống (Next.js / NestJS)|
:Kiểm tra Idempotency Key (chống gửi trùng yêu cầu);
:Mở Transaction: Tạo đơn hàng (PENDING) & Giữ/Trừ tồn kho;

|Dịch vụ Thanh toán (Payment Service)|
:Thực hiện xử lý thanh toán mô phỏng (Ví/Thẻ);

|Hệ thống (Next.js / NestJS)|
if (Kết quả thanh toán?) then (Thành công)
:Cập nhật Payment = SUCCESS, Order = CONFIRMED;
:Cộng điểm tích lũy (LoyaltyTransaction);
:Làm rỗng Giỏ hàng;
:Hiển thị thông báo "Đặt hàng thành công";

|Khách hàng|
:Theo dõi trạng thái đơn hàng & Xem lịch sử đơn;
stop
else (Thất bại)
:Cập nhật Payment = FAILED, Order = CANCELLED;
:Hoàn lại (Rollback) số lượng tồn kho;
:Hiển thị thông báo "Thanh toán thất bại, vui lòng thử lại";
stop
endif
@enduml