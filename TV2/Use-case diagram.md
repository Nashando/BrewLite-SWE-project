@startuml
left to right direction
skinparam packageStyle rectangle
skinparam actorStyle outline

actor "Khách hàng" as Customer
actor "Nhân viên pha chế" as Staff
actor "Quản lý (Manager)" as Manager
actor "Cổng thanh toán ngoài" as Gateway #lightgreen

rectangle "Hệ thống BrewLite (POS & Ordering System)" {
  usecase "Đăng ký tài khoản" as UC1
  usecase "Đăng nhập / Xác thực JWT" as UC2
  usecase "Xem danh mục menu & tìm kiếm" as UC3
  usecase "Xem chi tiết sản phẩm & Topping" as UC4
  usecase "Quản lý giỏ hàng (Thêm/Sửa/Xóa)" as UC5
  usecase "Đặt đơn & Thanh toán trực tuyến" as UC6
  usecase "Xem lịch sử đơn hàng" as UC7
  usecase "Hủy đơn hàng (Khi chưa xử lý)" as UC8
  
  usecase "Kiểm tra tồn kho" as UC_Stock
  usecase "Xử lý giao dịch thanh toán" as UC_Pay
  
  usecase "Quản lý trạng thái đơn hàng (Chờ/Làm/Xong)" as UC9
  usecase "Quản lý sản phẩm & Kho hàng" as UC10
  usecase "Thống kê doanh thu & Báo cáo" as UC11
}

' Customer interactions
Customer --> UC1
Customer --> UC2
Customer --> UC3
Customer --> UC4
Customer --> UC5
Customer --> UC6
Customer --> UC7
Customer --> UC8

' Includes & Extends
UC6 ..> UC2 : <<include>>
UC6 ..> UC_Stock : <<include>>
UC6 ..> UC_Pay : <<include>>
UC8 ..> UC6 : <<extend>>

' External Gateway
UC_Pay --> Gateway

' Staff & Manager interactions
Staff --> UC9
Manager --> UC9
Manager --> UC10
Manager --> UC11
@enduml