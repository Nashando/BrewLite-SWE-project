# Sơ đồ thiết kế (Task 2)

Mỗi sơ đồ có file nguồn PlantUML (`.puml`) và ảnh xuất ra (`.svg`). Khi sửa sơ đồ, sửa file `.puml` rồi xuất lại ảnh.

| Sơ đồ | Nguồn | Ảnh |
|---|---|---|
| Use-case tổng quát | [usecase.puml](usecase.puml) | [usecase.svg](usecase.svg) |
| Use-case UC-CHECKOUT | [usecase-checkout.puml](usecase-checkout.puml) | [usecase-checkout.svg](usecase-checkout.svg) |
| Activity: đặt và thanh toán | [activity.puml](activity.puml) | [activity.svg](activity.svg) |
| Sequence: đặt và thanh toán | [sequence.puml](sequence.puml) | [sequence.svg](sequence.svg) |
| Class: domain model | [class.puml](class.puml) | [class.svg](class.svg) |
| Deployment (TV3) | [deployment-diagram.puml](deployment-diagram.puml) | [deployment-diagram.svg](deployment-diagram.svg) |

Đặc tả use-case nằm ở [`docs/requirements/use-case-checkout.md`](../requirements/use-case-checkout.md).

## Cấu trúc ba sơ đồ Task 2

- **Activity:** bốn swimlane Khách hàng, Next.js UI, NestJS API và Nhân viên quầy; thể hiện nhánh chưa đăng nhập, hết kho, replay, CASH và Ví/Thẻ thành công/thất bại. Checkout của khách kết thúc trước bước quầy thu CASH.
- **Sequence:** cấu trúc đối tượng actor → boundary → control → entity, tên đối tượng gạch chân, thanh kích hoạt, lời gọi và trả về; `loop` cập nhật kho theo productId và `alt` cho idempotency/thanh toán. Database đại diện truy cập Prisma/PostgreSQL; PaymentService là control nội bộ NestJS.
- **Class:** lớp ba ngăn (tên, thuộc tính, phương thức), kiểu dữ liệu, dấu `+`/`-`, association/composition và multiplicity. Hành vi được nhóm theo domain và ánh xạ về service/helper thực thi trong chú giải; không khẳng định Prisma model có các method đó. Promotion/Loyalty giữ ngăn phương thức trống vì chưa triển khai.

Sơ đồ dùng dữ liệu/nghiệp vụ BrewLite từ main 9808d37. Tên kiểu View/Response trong class là tên mô tả response; các nhãn lời gọi giao diện/guard trong sequence thể hiện trách nhiệm, không phải danh sách API hoặc type được export. Mã FR/UC và đường dẫn được giữ thống nhất với [ma trận truy vết 5 cột](../traceability-matrix.md).

Thành phần ghi `«mở rộng»` (khuyến mãi, tích điểm) thuộc domain mở rộng, chưa có trong cơ sở dữ liệu. Thanh toán CASH và xác nhận thu tiền tại quầy đã có code.

## Đối chiếu source 9808d37 — 15/11/2026

SRS/use-case/matrix đã được sửa trong bộ tài liệu này; ma trận có 5 cột theo mẫu mục 8.1 của Assignment, tách Use-case/User Story và Thiết kế/Sơ đồ. CASH có code thật; Promotion/LoyaltyTransaction trong class là domain mở rộng theo Task 2.3, chưa có model/API. PaymentService trong sequence là module nội bộ API, không phải external gateway.

Deployment mô tả cấu hình repo Vercel/Render Git runtime và CD quality → deploy-api → smoke-test. Container registry Docker Hub cấp node:22-alpine/postgres:16-alpine cho Dockerfiles/Compose; không khẳng định đã có app image GHCR. Task 5.3 app-image/tag/registry và các cấu hình cloud cần minh chứng riêng.

| Node/dịch vụ | Source/ADR để truy vết |
|---|---|
| Browser/Next.js/Vercel | apps/web, apps/web/next.config.mjs, ADR005 |
| NestJS/PaymentService/Render | apps/api/src/main.ts, apps/api/src/payment/payment.service.ts, apps/api/package.json, ADR004/007 |
| PostgreSQL/storage/migration | apps/api/prisma/schema.prisma, prisma/migrations, docker-compose.yml volume pgdata, ADR002 |
| Registry base image | FROM node:22-alpine trong Dockerfiles, image postgres:16-alpine trong Compose |
| GitHub Actions/Deploy Hook | .github/workflows/ci.yml, cd.yml; secret environment production; ADR007 |
| Health/log/env | apps/api/src/health/health.controller.ts, main.ts/app.setup.ts/config, ADR006 |

[Đối chiếu yêu cầu đề](../requirements/assignment-conformance.md), [ma trận](../traceability-matrix.md). Không coi ảnh sơ đồ là bằng chứng Dashboard hoặc run container thật.

## Xuất lại ảnh

Cần Java và Graphviz; tải `plantuml.jar` từ [plantuml.com](https://plantuml.com/download).

```bash
java -jar plantuml.jar -charset UTF-8 -tsvg docs/diagrams/*.puml
```

Plugin PlantUML của WebStorm hoặc VS Code cũng xem và xuất được.

## Bản chi tiết dùng trong báo cáo

Các phần dưới đây tách cùng luồng Activity/Sequence thành các hình dễ đọc; không bổ sung API hoặc nghiệp vụ mới.

| Phần | Nguồn | SVG |
|---|---|---|
| activity-01-create | [PlantUML](details/activity-01-create.puml) | [SVG](details/activity-01-create.svg) |
| activity-02-checks | [PlantUML](details/activity-02-checks.puml) | [SVG](details/activity-02-checks.svg) |
| activity-03-payment | [PlantUML](details/activity-03-payment.puml) | [SVG](details/activity-03-payment.svg) |
| activity-04-counter | [PlantUML](details/activity-04-counter.puml) | [SVG](details/activity-04-counter.svg) |
| sequence-01-create | [PlantUML](details/sequence-01-create.puml) | [SVG](details/sequence-01-create.svg) |
| sequence-02-checks | [PlantUML](details/sequence-02-checks.puml) | [SVG](details/sequence-02-checks.svg) |
| sequence-03-transaction | [PlantUML](details/sequence-03-transaction.puml) | [SVG](details/sequence-03-transaction.svg) |
| sequence-04-cash | [PlantUML](details/sequence-04-cash.puml) | [SVG](details/sequence-04-cash.svg) |
