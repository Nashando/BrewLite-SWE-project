# Ma trận truy vết (Traceability Matrix)

| Mã yêu cầu | Use-case / Sơ đồ | Code / API | Test |
|---|---|---|---|
| FR-01 | usecase.svg, activity.svg, class.svg | API: `GET /products`<br>UI: `src/app/menu/page.tsx` | UI: `tests/web/menu/MenuScreen.test.tsx` |
| FR-02 | usecase.svg, activity.svg, class.svg | API: `GET /products/:id`<br>UI: `src/app/products/[id]/page.tsx` | UI: `tests/web/product/ProductDetailScreen.test.tsx` |
| FR-03 | activity.svg | API: `GET /cart`, `POST /cart/items`<br>UI: `src/app/cart/page.tsx` | UI: `tests/web/cart/CartScreen.test.tsx` |
| FR-04 | activity.svg | API: `POST /auth/register`, `POST /auth/login`<br>UI: `src/app/login/page.tsx` | INT-T01 (`integration/auth.test.mjs`) |
| FR-05 | usecase-checkout.svg, sequence.svg, activity.svg, class.svg | API: `POST /orders`, `POST /payments`<br>UI: `src/app/checkout/page.tsx` | INT-T03 (`integration/payments.test.mjs`)<br>E2E-T01 (`e2e/checkout.spec.mjs`) |
| FR-06 | activity.svg, class.svg | API: `GET /orders`<br>UI: `src/app/orders/page.tsx` | INT-T02 (`integration/orders.test.mjs`) |
| FR-07 | activity.svg, class.svg | API: `PATCH /orders/:id/status`<br>UI: `src/app/staff/orders/page.tsx` | INT-T05 (`integration/staff-admin.test.mjs`)<br>E2E-T04 (`e2e/staff.spec.mjs`) |
| FR-08 | class.svg | API: `/admin/products`, `/admin/toppings`<br>UI: `src/app/admin/page.tsx` | E2E-T05 (`e2e/admin.spec.mjs`) |
| FR-09 | activity.svg | API: `POST /orders/:id/cancel`<br>UI: `src/app/orders/page.tsx` | INT-T04 (`integration/cash-cancel.test.mjs`) |
| FR-10 | usecase.svg | (Chưa code API - Tính năng mở rộng) | (Chưa có test) |
| FR-11 | usecase.svg | API: `GET /admin/reports/revenue`<br>UI: `src/app/admin/page.tsx` | INT-T05 (`integration/staff-admin.test.mjs`) |
| NFR-05 | deployment-diagram.svg | API: `GET /health` | Smoke Test (trên CI/CD) |
