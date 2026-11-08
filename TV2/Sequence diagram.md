
@startuml
autonumber
skinparam BoxPadding 10
skinparam ParticipantPadding 10

actor "Customer" as Cust
participant "Next.js UI (PWA)" as UI
participant "NestJS AuthGuard" as Auth
participant "OrderController" as Ctrl
participant "OrderService" as Svc
participant "Payment Service (Mock)" as Pay
database "PostgreSQL DB" as DB

Cust -> UI: Select beverage (size/topping) & click "Checkout"
activate UI

UI -> Auth: POST /api/v1/orders/checkout\n(Header: Bearer JWT, Idempotency-Key)\n(Body: CartItems, PaymentInfo)
activate Auth

Auth -> Auth: Verify JWT Token & Validate DTO

alt Invalid / Expired JWT
    Auth --> UI: 401 Unauthorized
    UI --> Cust: Please log in again
else Valid JWT
    Auth -> Ctrl: Forward Request
    deactivate Auth
    activate Ctrl

    Ctrl -> Svc: processCheckout(userId, checkoutDTO, idempotencyKey)
    activate Svc

    Svc -> DB: Check Idempotency-Key in DB/Cache
    activate DB
    DB --> Svc: Key does not exist (New Request)
    deactivate DB

    Svc -> DB: BEGIN TRANSACTION\n- Check inventory (SELECT FOR UPDATE)\n- Create Order (Status=PENDING)\n- Temporarily deduct stock
    activate DB

    alt Out of Stock / Insufficient Inventory
        DB --> Svc: Stock Unavailable (Rollback)
        Svc --> Ctrl: 400 Bad Request (Product Out of Stock)
        Ctrl --> UI: Error Response
        UI --> Cust: Display out-of-stock notification
    else Sufficient Stock & PENDING Order Created
        DB --> Svc: Transaction Committed (OrderID)
        deactivate DB

        Svc -> Pay: processPayment(OrderID, Amount, PaymentMethod)
        activate Pay

        alt Payment Failed (Insufficient Wallet Balance / Card Error)
            Pay --> Svc: Payment Failed (Error Code)
            Svc -> DB: UPDATE orders SET status = 'CANCELLED'\n& Restore Inventory
            Svc --> Ctrl: 402 Payment Required / 400 Error
            Ctrl --> UI: Payment Failed
            UI --> Cust: Display payment error & allow retry
        else Payment Successful
            Pay --> Svc: Payment Success (TransactionRef)
            deactivate Pay

            Svc -> DB: UPDATE orders SET status = 'PAID'\n- Add Loyalty Points
            activate DB
            DB --> Svc: Updated Successfully
            deactivate DB

            Svc --> Ctrl: OrderResponseDTO (OrderID, Status=PAID)
            deactivate Svc

            Ctrl --> UI: 201 Created (Paid Order Details)
            deactivate Ctrl

            UI -> UI: Clear Local Cart
            UI --> Cust: Display success notification & Pickup QR Code
        end
    end
end

deactivate UI
@enduml