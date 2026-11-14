# Ma trận truy vết (Traceability Matrix)

| Mã yêu cầu | Use-case / Sơ đồ | Code / API | Test |
|---|---|---|---|
| FR-01 | usecase.svg, activity.svg, class.svg | API: `GET /products`<br>UI: `apps/web/src/app/menu/page.tsx` | UI: `apps/web/src/features/menu/__tests__/MenuScreen.test.tsx` |
| FR-02 | usecase.svg, activity.svg, class.svg | API: `GET /products/:id`<br>UI: `apps/web/src/app/products/[id]/page.tsx` | UI: `apps/web/src/features/product/__tests__/ProductDetailScreen.test.tsx` |
| FR-03 | activity.svg | API: `GET /cart`, `POST /cart/items`<br>UI: `apps/web/src/app/cart/page.tsx` | UI: `apps/web/src/features/cart/__tests__/CartScreen.test.tsx` |
| FR-04 | activity.svg | API: `POST /auth/login`, `POST /auth/register`<br>UI: `apps/web/src/app/login/page.tsx` | INT: `tests/integration/auth.test.mjs` |
| FR-05 | usecase-checkout.svg, sequence.svg, activity.svg, class.svg | API: `POST /orders`, `POST /payments`<br>UI: `apps/web/src/app/checkout/page.tsx` | INT: `tests/integration/payments.test.mjs`<br>E2E: `tests/e2e/checkout.spec.mjs` |
| FR-06 | activity.svg, class.svg | API: `GET /orders`<br>UI: `apps/web/src/app/orders/page.tsx` | INT: `tests/integration/orders.test.mjs` |
| FR-07 | activity.svg, class.svg | API: `PATCH /orders/:id/status`, `POST /orders/:id/confirm-cash`, `GET /orders/all`<br>UI: `apps/web/src/app/staff/page.tsx` | INT: `tests/integration/staff-admin.test.mjs`<br>E2E: `tests/e2e/staff.spec.mjs` |
| FR-08 | usecase.svg, activity.svg | API: `POST /orders/:id/cancel`<br>UI: `apps/web/src/app/orders/page.tsx` | INT: `tests/integration/cash-cancel.test.mjs` |
| FR-09 | usecase.svg | *(Tích hợp trong API GET /products?search=)*<br>UI: `apps/web/src/app/menu/page.tsx` | UI: `apps/web/src/features/menu/__tests__/matchesSearch.test.ts` |
| FR-10 | usecase.svg, class.svg | API: `/admin/products`, `/admin/toppings`<br>UI: `apps/web/src/app/admin/products/page.tsx`, `apps/web/src/app/admin/toppings/page.tsx` | E2E: `tests/e2e/admin.spec.mjs` |
| FR-11 | usecase.svg | API: `GET /admin/reports/revenue`<br>UI: `apps/web/src/app/admin/revenue/page.tsx` | INT: `tests/integration/staff-admin.test.mjs` |
| NFR-01 | (Kiến trúc) | Next.js App Router (SSR/CSR tối ưu) | (Đo bằng Lighthouse/Network tab) |
| NFR-02 | (Sequence) | `apps/api/src/auth/auth.service.ts` | INT: `tests/integration/auth.test.mjs` |
| NFR-03 | (PWA) | `apps/web/public/manifest.json` | (Kiểm thử thủ công viewport 375px) |
| NFR-04 | deployment-diagram.svg | `.github/workflows/cd.yml` | E2E: `tests/e2e/checkout.spec.mjs` |
| NFR-05 | deployment-diagram.svg | API: `GET /health` | Smoke test trong CI/CD |
