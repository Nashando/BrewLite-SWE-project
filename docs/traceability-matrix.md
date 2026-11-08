# Ma trận truy vết (Traceability Matrix)

| Mã yêu cầu | Use-case / Sơ đồ | Code / API | Test |
|---|---|---|---|
| FR-01 | Activity-01, Class-01 | API: `GET /products`<br>UI: `apps/web/src/app/menu/page.tsx` | UI: `web/features/menu/__tests__/MenuScreen.test.tsx`<br>API: `api/products/products.service.spec.ts` |
| FR-02 | Activity-01, Class-01 | API: `GET /products/:id`<br>UI: `apps/web/src/app/products/[id]/page.tsx` | UI: `web/features/product/__tests__/ProductDetailScreen.test.tsx`<br>API: `api/products/products.service.spec.ts` |
| FR-03 | Activity-02 | API: `POST /cart`<br>UI: `apps/web/src/app/cart/page.tsx` | UI: `web/features/cart/__tests__/CartScreen.test.tsx`<br>UI: `web/features/cart/__tests__/calculateTotal.test.ts` |
| FR-04 | Activity-03 | API: `POST /auth/login`<br>UI: `apps/web/src/app/login/page.tsx` | API: `api/auth/auth.service.spec.ts`<br>INT: `integration/auth.test.mjs` |
| FR-05 | UC-01 Thanh toán, Sequence-01 | API: `POST /orders`, `POST /payments`<br>UI: `apps/web/src/app/checkout/page.tsx` | API: `api/order/order.service.spec.ts`, `api/payment/payment.service.spec.ts`<br>INT: `integration/orders.test.mjs`, `integration/payments.test.mjs`<br>E2E: `e2e/checkout.spec.mjs` |
| FR-06 | Activity-04 | API: `GET /orders`<br>UI: `apps/web/src/app/orders/page.tsx` | API: `api/orders/orders.service.spec.ts` |
| FR-07 | Activity-05 | API: `PUT /orders/:id/status`<br>UI: (Đang cập nhật) | API: `api/orders/orders.service.spec.ts` (phần admin/staff) |
