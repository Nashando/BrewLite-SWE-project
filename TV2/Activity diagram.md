@startuml
title Activity Diagram - Quy trình Đặt & Thanh toán chi tiết (Extended)

|Khách hàng|
start
:Thêm sản phẩm & Topping vào giỏ hàng;
:Nhấn nút "Tiến hành thanh toán";

|Hệ thống Frontend|
:Kiểm tra trạng thái đăng nhập JWT;
if (Đã đăng nhập hợp lệ?) then (Có)
  :Gửi request gọi API thanh toán;
|Hệ thống Backend|
  :Kiểm tra giỏ hàng có trống không?;
  if (Giỏ hàng trống?) then (Có)
    |Hệ thống Frontend|
    :Hiển thị lỗi "Giỏ hàng trống";
    stop
  else (Không trống)
    |Hệ thống Backend|
    :Kiểm tra tồn kho (Product & Topping Stock);
    if (Đủ hàng trong kho?) then (Đủ)
      :Tính toán tổng tiền (Giá + Topping - Khuyến mãi);
      :Chuyển hướng sang Cổng thanh toán mô phỏng;
      
      |Cổng thanh toán|
      :Hiển thị giao diện xác nhận số dư/thẻ;
      |Khách hàng|
      :Xác nhận thanh toán giao dịch;
      |Cổng thanh toán|
      if (Thanh toán thành công từ ngân hàng?) then (Thành công)
        |Hệ thống Backend|
        :Tạo bản ghi Order & OrderItem trong Database;
        :Cập nhật (Trừ) số lượng tồn kho sản phẩm;
        :Xóa dữ liệu giỏ hàng của User;
        :Gửi thông báo thời gian thực (WebSocket) tới Quầy;
        
        |Hệ thống Frontend|
        :Hiển thị màn hình "Đặt hàng thành công" + Mã đơn;
        stop
      else (Thất bại / Hủy)
        |Hệ thống Backend|
        :Ghi log giao dịch thất bại;
        |Hệ thống Frontend|
        :Hiển thị thông báo "Thanh toán không thành công";
        stop
      endif
      
    else (Thiếu hàng / Hết hàng)
      |Hệ thống Frontend|
      :Hiển thị danh sách sản phẩm vượt quá tồn kho;
      :Yêu cầu khách hàng cập nhật lại giỏ hàng;
      stop
    endif
  endif
else (Chưa đăng nhập)
  |Hệ thống Frontend|
  :Chuyển hướng người dùng sang trang Login;
  stop
endif
@enduml