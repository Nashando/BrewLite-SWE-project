# Ma trận truy vết (Traceability Matrix)

Bảng dưới đây thể hiện sự liên kết giữa Yêu cầu (FR/NFR) với Use-case, Sơ đồ thiết kế, Code/API và Test tương ứng.

| Mã yêu cầu | Use-case / User Story | Thiết kế / Sơ đồ | Code / API | Test |
|---|---|---|---|---|
| FR-01 | US-01 Xem menu | Activity-01, Class-01 | GET /products | API-T01 |
| FR-02 | US-02 Xem chi tiết sản phẩm | Activity-01, Class-01 | GET /products/:id | API-T02 |
| FR-03 | US-03 Giỏ hàng | Activity-02 | POST /cart | API-T03 |
| FR-04 | US-04 Đăng ký / Đăng nhập | Activity-03 | POST /auth/login | INT-T01 |
| FR-05 | UC-01 Đặt và thanh toán đơn hàng | Sequence-01, Class-02 | POST /orders, POST /payments | INT-T03, E2E-T01 |
| FR-06 | US-06 Lịch sử đơn | Activity-04 | GET /orders | API-T04 |
| FR-07 | US-07 Quản lý trạng thái đơn | Activity-05 | PUT /orders/:id/status | API-T05 |

*(Ghi chú: Đây là bản nháp v1. Tên sơ đồ, API và mã Test sẽ được cập nhật chính xác khi TV2, TV4, TV5, TV6 hoàn thành code).*
