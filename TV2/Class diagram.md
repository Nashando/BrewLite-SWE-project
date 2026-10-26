@startuml
skinparam classAttributeIconSize 0
title Class Diagram - Domain Model Chi tiết Hệ thống BrewLite

class User {
  - String id
  - String username
  - String email
  - String passwordHash
  - String fullName
  - String phone
  - String role [CUSTOMER, STAFF, MANAGER]
  - Date createdAt
  + register(): Boolean
  + login(): String
  + updateProfile(): void
  + changePassword(oldPass: String, newPass: String): Boolean
}

class Product {
  - String id
  - String name
  - Double basePrice
  - String description
  - String imageUrl
  - Integer stockQuantity
  - Boolean isAvailable
  + updateStock(quantity: Integer): void
  + checkAvailability(requiredQty: Integer): Boolean
  + getProductDetails(): ProductDTO
}

class Topping {
  - String id
  - String name
  - Double extraPrice
  - Boolean isAvailable
}

class Cart {
  - String id
  - String userId
  - Date updatedAt
  + addItem(item: CartItem): void
  + removeItem(itemId: String): void
  + updateItemQuantity(itemId: String, qty: Integer): void
  + calculateTotalPrice(): Double
  + clearCart(): void
}

class CartItem {
  - String id
  - Integer quantity
  - String selectedSize [S, M, L]
  + getSubTotal(): Double
}

class Order {
  - String id
  - String userId
  - Date createdAt
  - Double totalAmount
  - String status [PENDING, PROCESSING, COMPLETED, CANCELLED]
  - String paymentMethod [MOMO, VNPAY, CASH]
  - String paymentStatus [PAID, UNPAID, REFUNDED]
  + createOrder(): Boolean
  + updateStatus(newStatus: String): void
  + cancelOrder(): Boolean
}

class OrderItem {
  - String id
  - Integer quantity
  - String size
  - Double unitPrice
  + calculateItemTotal(): Double
}

class PaymentTransaction {
  - String transactionId
  - String orderId
  - Double amount
  - String gatewayResponseCode
  - Date transactionDate
  + processPayment(): Boolean
  + refundPayment(): Boolean
}

' Relationships with Multiplicity
User "1" --> "0..1" Cart : sở hữu >
Cart "1" *-- "0..*" CartItem : chứa các >
CartItem "0..*" --> "1" Product : tham chiếu đến >
CartItem "0..*" o-- "0..*" Topping : kèm theo >

User "1" --> "0..*" Order : đặt mua >
Order "1" *-- "1..*" OrderItem : bao gồm các >
OrderItem "0..*" --> "1" Product : sản phẩm trong đơn >
OrderItem "0..*" o-- "0..*" Topping : topping đã chọn >

Order "1" -- "0..1" PaymentTransaction : thanh toán qua >

@enduml