# Ma trận truy vết (Traceability Matrix)

Bảng dưới đây thể hiện sự liên kết giữa Yêu cầu (FR) với Use-case, Sơ đồ thiết kế, Code/API và Test tương ứng.

| Mã yêu cầu | Use-case / Sơ đồ | Code / API | Test |
|---|---|---|---|
| FR-01 | Activity-01, Class-01 | API: `GET /products` (thư mục `products`)<br>UI: `apps/web/src/app/menu/page.tsx` | API-T01 |
| FR-02 | Activity-01, Class-01 | API: `GET /products/:id` (thư mục `products`)<br>UI: `apps/web/src/app/products/[id]/page.tsx` | API-T02 |
| FR-03 | Activity-02 | API: `POST /cart` (thư mục `cart`)<br>UI: `apps/web/src/app/cart/page.tsx` | API-T03 |
| FR-04 | Activity-03 | API: `POST /auth/login` (thư mục `auth`)<br>UI: `apps/web/src/app/login/page.tsx`<br>UI: `apps/web/src/app/register/page.tsx` | INT-T01 |
| FR-05 | UC-01 Thanh toán, Sequence-01 | API: `POST /orders` (thư mục `order`)<br>API: `POST /payments` (thư mục `payment`)<br>UI: `apps/web/src/app/checkout/page.tsx` | INT-T03, E2E-T01 |
| FR-06 | Activity-04 | API: `GET /orders` (thư mục `orders`)<br>UI: `apps/web/src/app/orders/page.tsx` | API-T04 |
| FR-07 | Activity-05 | API: `PUT /orders/:id/status` (thư mục `orders`)<br>UI: (Đang cập nhật) | API-T05 |
