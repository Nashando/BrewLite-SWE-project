@startuml
title Class Diagram - Domain Model BrewLite

' Các Enum trạng thái bắt buộc
enum UserRole {
CUSTOMER
STAFF
MANAGER
}

enum OrderStatus {
PENDING
CONFIRMED
PREPARING
READY
COMPLETED
CANCELLED
}

enum PaymentStatus {
PENDING
PAID
FAILED
REFUNDED
}

enum PaymentMethod {
WALLET
CREDIT_CARD
CASH
}

enum LoyaltyTxType {
EARN
REDEEM
}

' Các lớp Domain chính
class User {
+ String id
+ String username
+ String passwordHash
+ String fullName
+ String phone
+ Integer loyaltyPoints
+ UserRole role
+ login()
+ register()
  }

class Product {
+ String id
+ String name
+ Double basePrice
+ String image
+ String description
+ Integer stockQuantity
+ Boolean isAvailable
+ checkAvailability(qty: Integer): Boolean
  }

class Topping {
+ String id
+ String name
+ Double price
+ Boolean isAvailable
  }

class Cart {
+ String id
+ String userId
+ calculateTotal(): Double
+ addItem()
+ removeItem()
+ clear()
  }

class CartItem {
+ String id
+ Integer quantity
+ String size
  }

class Order {
+ String id
+ String userId
+ String promotionId
+ Date createdAt
+ Double subTotal
+ Double discountAmount
+ Double totalAmount
+ String shippingAddress
+ OrderStatus status
+ PaymentStatus paymentStatus
+ createOrder()
+ updateStatus(newStatus: OrderStatus)
  }

class OrderItem {
+ String id
+ Integer quantity
+ String size
+ Double unitPrice
+ Double subtotal
  }

class Payment {
+ String id
+ String orderId
+ String idempotencyKey
+ String transactionRef
+ Double amount
+ PaymentMethod method
+ PaymentStatus status
+ Date paidAt
+ processPayment(): Boolean
  }

class Promotion {
+ String id
+ String code
+ String description
+ Double discountPercent
+ Double maxDiscountAmount
+ Date validFrom
+ Date validTo
+ Boolean isActive
+ isValid(): Boolean
  }

class LoyaltyTransaction {
+ String id
+ String userId
+ String orderId
+ Integer points
+ LoyaltyTxType type
+ Date createdAt
  }

' Quan hệ và Multiplicity
User "1" -- "0..1" Cart : owns >
Cart "1" *-- "0..*" CartItem : contains >
CartItem "0..*" --> "1" Product : references >
CartItem "0..*" --> "0..*" Topping : includes >

User "1" -- "0..*" Order : places >
Order "1" *-- "1..*" OrderItem : contains >
OrderItem "0..*" --> "1" Product : references >
OrderItem "0..*" --> "0..*" Topping : includes >

Order "1" -- "1..*" Payment : paid via >
Promotion "0..1" -- "0..*" Order : applied to >
User "1" -- "0..*" LoyaltyTransaction : has >
Order "0..1" -- "0..*" LoyaltyTransaction : generates >

User ..> UserRole
Order ..> OrderStatus
Order ..> PaymentStatus
Payment ..> PaymentStatus
Payment ..> PaymentMethod
LoyaltyTransaction ..> LoyaltyTxType

@enduml