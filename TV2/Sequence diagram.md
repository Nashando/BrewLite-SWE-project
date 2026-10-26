@startuml
autonumber
skinparam BoxPadding 10
skinparam ParticipantPadding 10

actor "Khách hàng" as Cust
participant "Client (React/Flutter)" as UI
participant "API Gateway / AuthFilter" as Auth
participant "OrderController" as Ctrl
participant "OrderService" as Svc
participant "InventoryService" as Inv
database "MySQL Database" as DB

Cust -> UI: Chọn sản phẩm, nhập thông tin & bấm "Thanh toán"
activate UI

UI -> Auth: POST /api/v1/orders (Bearer Token, CartID, PaymentInfo)
activate Auth

Auth -> Auth: Xác thực chữ ký JWT & phân quyền Role=Customer
alt Token không hợp lệ / Hết hạn
    Auth --> UI: 401 Unauthorized
    UI --> Cust: Yêu cầu đăng nhập lại
else Token hợp lệ
    Auth -> Ctrl: Chuyển tiếp Request (DTO)
    deactivate Auth
    activate Ctrl
    
    Ctrl -> Svc: processCheckout(userId, orderRequest)
    activate Svc
    
    Svc -> Inv: validateAndLockStock(items)
    activate Inv
    Inv -> DB: SELECT stock FROM products WHERE id IN (...) FOR UPDATE
    activate DB
    DB --> Inv: Trả về danh sách tồn kho
    deactivate DB
    
    alt Tồn kho không đủ cho bất kỳ sản phẩm nào
        Inv --> Svc: throw OutOfStockException()
        deactivate Inv
        Svc --> Ctrl: 400 Bad Request (Thiếu tồn kho)
        Ctrl --> UI: Error Response (Sản phẩm hết hàng)
        UI --> Cust: Hiển thị lỗi chi tiết sản phẩm hết hàng
    else Tồn kho đủ điều kiện
        Inv --> Svc: Stock Validated & Reserved
        deactivate Inv
        
        Svc -> Svc: Tính toán tổng tiền & Tạo mã Order Code
        
        Svc -> DB: BEGIN TRANSACTION\n- INSERT INTO orders\n- INSERT INTO order_items\n- UPDATE products SET stock = stock - qty
        activate DB
        DB --> Svc: Transaction Committed Successfully
        deactivate DB
        
        Svc --> Ctrl: OrderResponseDTO (OrderID, Status=PENDING)
        deactivate Svc
        
        Ctrl --> UI: 201 Created (Thông tin đơn hàng)
        deactivate Ctrl
        
        UI -> UI: Xóa giỏ hàng local / Redux store
        UI --> Cust: Hiển thị màn hình thành công & Mã tra cứu đơn
    end
end
deactivate UI
@enduml