@startuml
title Sequence Diagram - Đặt và Thanh Toán Đơn Hàng (UC-CHECKOUT)

autonumber
actor "Customer" as Customer
participant "Next.js UI" as UI
participant "NestJS API" as API
database "Database\n(PostgreSQL)" as DB
participant "Payment Service" as PaymentSvc

Customer -> UI: Nhấn "Xác nhận đặt hàng & Thanh toán"
activate UI

UI -> API: POST /api/orders/checkout\nHeaders: { Authorization: Bearer <JWT>, Idempotency-Key: <UUID> }\nBody: { items, address, paymentMethod, promotionCode }
activate API

' 1. Kiểm tra JWT và Validate dữ liệu
API -> API: Verify JWT Token & Validate DTO

alt JWT không hợp lệ hoặc Dữ liệu sai định dạng
API --> UI: 401 Unauthorized / 400 Bad Request
UI --> Customer: Hiển thị thông báo yêu cầu đăng nhập / lỗi dữ liệu
else JWT và Dữ liệu hợp lệ

    ' 2. Kiểm tra Idempotency khi client gửi lại yêu cầu
    API -> DB: SELECT Payment/Order BY idempotencyKey
    activate DB
    DB --> API: Kết quả kiểm tra Idempotency
    deactivate DB

    alt Yêu cầu bị trùng lặp (Idempotency-Key đã xử lý)
        API --> UI: 200 OK (Trả về kết quả Order/Payment đã tạo trước đó)
        UI --> Customer: Hiển thị kết quả đơn hàng (Không trừ tiền/tồn kho lần 2)

        ' 3. Transaction khi tạo đơn và cập nhật tồn kho
        API -> DB: BEGIN TRANSACTION
        activate DB
        API -> DB: SELECT stockQuantity FROM Product FOR UPDATE
        DB --> API: Số lượng tồn kho hiện tại

        alt Tồn kho không đủ (Hết hàng)
            API -> DB: ROLLBACK TRANSACTION
            API --> UI: 409 Conflict (Sản phẩm không đủ tồn kho)
            UI --> Customer: Thông báo lỗi hết hàng & Quay lại Giỏ hàng
        else Tồn kho hợp lệ
            API -> DB: INSERT INTO Order (status = PENDING) & OrderItem
            API -> DB: UPDATE Product SET stockQuantity = stockQuantity - quantity
            API -> DB: INSERT INTO Payment (status = PENDING, idempotencyKey)
            API -> DB: COMMIT TRANSACTION
            DB --> API: Order & Payment Created
            deactivate DB

            ' 4. Gọi Payment Service xử lý thanh toán
            API -> PaymentSvc: POST /pay (orderId, amount, paymentMethod, idempotencyKey)
            activate PaymentSvc
            
            alt Thanh toán thành công
                PaymentSvc --> API: 200 OK (transactionRef, status = SUCCESS)
                
                API -> DB: BEGIN TRANSACTION
                activate DB
                API -> DB: UPDATE Payment SET status = SUCCESS
                API -> DB: UPDATE Order SET status = CONFIRMED, paymentStatus = PAID
                API -> DB: INSERT INTO LoyaltyTransaction (pointsEarned)
                API -> DB: DELETE CartItem (Làm rỗng giỏ hàng)
                API -> DB: COMMIT TRANSACTION
                DB --> API: Cập nhật hoàn tất
                deactivate DB

                API --> UI: 201 Created (Order & Payment Success Info)
                UI -> UI: Đồng bộ làm rỗng trạng thái Giỏ hàng trên UI
                UI --> Customer: Hiển thị màn hình "Đặt hàng thành công" & Mã đơn

            else Thanh toán thất bại
                PaymentSvc --> API: 402 Payment Failed (errorCode, message)
                deactivate PaymentSvc

                API -> DB: BEGIN TRANSACTION
                activate DB
                API -> DB: UPDATE Payment SET status = FAILED
                API -> DB: UPDATE Order SET status = CANCELLED, paymentStatus = FAILED
                API -> DB: UPDATE Product SET stockQuantity = stockQuantity + quantity (Hoàn kho)
                API -> DB: COMMIT TRANSACTION
                DB --> API: Đã hoàn lại tồn kho
                deactivate DB

                API --> UI: 400 Bad Request (Thanh toán thất bại)
                deactivate API
                UI --> Customer: Hiển thị thông báo "Thanh toán thất bại, vui lòng thử lại"
            end
        end
    end
end
deactivate UI
@enduml