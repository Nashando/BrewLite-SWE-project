# Ma trận truy vết (Traceability Matrix)

Bảng dưới đây thể hiện sự liên kết giữa Yêu cầu (FR) với Use-case, Sơ đồ thiết kế, Code/API (Frontend & Backend) và Test tương ứng.

| Mã yêu cầu | Use-case / Sơ đồ | Code / API | Test |
|---|---|---|---|
| FR-01 | Use-case diagram, Activity diagram, Class diagram | API: `GET /products`<br>UI: `apps/web/src/app/menu/page.tsx` | UI: `web/features/menu/__tests__/MenuScreen.test.tsx`<br>API: `api/products/products.service.spec.ts` |
| FR-02 | Use-case diagram, Activity diagram, Class diagram | API: `GET /products/:id`<br>UI: `apps/web/src/app/products/[id]/page.tsx` | UI: `web/features/product/__tests__/ProductDetailScreen.test.tsx`<br>API: `api/products/products.service.spec.ts` |
| FR-03 | Activity diagram | API: `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`<br>UI: `apps/web/src/app/cart/page.tsx` | UI: `web/features/cart/__tests__/CartScreen.test.tsx`<br>UI: `web/features/cart/__tests__/calculateTotal.test.ts` |
| FR-04 | Activity diagram | API: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`<br>UI: `apps/web/src/app/login/page.tsx` | API: `api/auth/auth.service.spec.ts`<br>INT: `integration/auth.test.mjs` |
| FR-05 | Use-case diagram, Sequence diagram, Activity diagram, Class diagram | API: `POST /order/checkout`, `POST /payments`<br>UI: `apps/web/src/app/checkout/page.tsx` | API: `api/order/order.service.spec.ts`, `api/payment/payment.service.spec.ts`<br>INT: `integration/orders.test.mjs`<br>E2E: `e2e/checkout.spec.mjs` |
| FR-06 | Activity diagram, Class diagram | API: `GET /orders`<br>UI: `apps/web/src/app/orders/page.tsx` | API: `api/orders/orders.service.spec.ts`<br>UI: `web/features/orders/__tests__/orders.test.tsx` |
| FR-07 | Activity diagram, Class diagram | API: `GET /orders` (Staff/Admin), `POST /orders/:id/cancel`<br>UI: `apps/web/src/app/staff/orders/page.tsx` | API: `api/orders/orders.service.spec.ts`<br>UI: `web/features/staff/__tests__/StaffOrdersScreen.test.tsx` |
