# Kiến trúc BrewLite — Task 3.1

Đối chiếu source main 9808d37 ngày 15/11/2026. Đây là mô tả C4 Level 1/2 kết hợp backend phân lớp; hình UML triển khai ở [deployment](../diagrams/deployment-diagram.svg). Các quyết định liên quan nằm trong [ADR](adr/).

## 1. C4 Level 1 — Bối cảnh
Khách vãng lai xem menu/chi tiết và giỏ trình duyệt; CUSTOMER tạo/thanh toán/theo dõi/hủy đơn; STAFF xử lý quầy; MANAGER thêm quản trị catalog/doanh thu. BrewLite là hệ thống order-ahead/pickup, không giao hàng và không thu tiền thật. PaymentService mô phỏng nằm trong NestJS, không phải một hệ thống/HTTP gateway bên ngoài.

## 2. C4 Level 2 — Container/dịch vụ
“Container” C4 là đơn vị ứng dụng/dữ liệu, không mặc định phải là Docker container production.
| Thành phần | Vai trò/source | Local | Production theo cấu hình repo |
|---|---|---|---|
| Next.js | apps/web; UI React, state giỏ/JWT, gọi REST | Dockerfile web/Compose hoặc Node dev/start | Vercel Git Integration, HTTPS/SSR/static assets |
| NestJS | apps/api; REST, phân quyền, order/payment | Dockerfile API/Compose hoặc Node | Render Web Service Node runtime build từ Git |
| PostgreSQL | apps/api/prisma, dữ liệu quan hệ và migration | postgres:16-alpine, volume pgdata | Render PostgreSQL/persistent storage, Internal URL phải được cấu hình |
| GitHub Actions | .github/workflows/ci.yml và cd.yml | Không giả lập thành dịch vụ ứng dụng | Runner CI quality; CD quality → deploy-api hook → smoke-test |
| Container registry | Docker Hub cho FROM node:22-alpine và postgres:16-alpine | Nguồn base image trong Dockerfiles/Compose | Không có job push/pull app image GHCR trong cd.yml main 9808d37 |

Sơ đồ hiện trạng không vẽ mũi tên Actions build/push GHCR hoặc Render pull image vì source hiện không có job đó. Đóng gói/tag/push app image theo Task 5.3 vẫn là phần cần hoàn thành; không thể chứng minh bằng cách thêm một node lý thuyết vào production diagram.

## 3. Backend phân lớp/module
Controller/guard/DTO → service domain → PrismaService/transaction → PostgreSQL.
- Auth: bcrypt, access/refresh JWT; RolesGuard và kiểm sở hữu đơn. Backend có refresh, frontend hiện logout khi 401.
- Products: menu/chi tiết; server hỗ trợ search/category; UI hiện lọc client.
- Cart: API/domain giỏ tồn tại; UI dùng Zustand/localStorage, chưa đồng bộ giỏ UI với server/thiết bị.
- Order: tính giá từ DB, snapshot đơn, trừ kho có điều kiện và thứ tự productId; lỗi rollback transaction.
- Orders: mine/all/detail, hủy trước PREPARING, confirm-cash và chuyển trạng thái đúng thứ tự.
- Payment: Wallet/Card/CASH mô phỏng, unique user/key, atomic claim đơn/trừ ví; 402 commit CANCELLED/FAILED/hoàn kho, 400 có thể giữ đơn/kho; mạng/5xx không suy ra kết quả.
- Expiry: helper kiểm TTL khi request liên quan, không có cron/timer nền.
- Admin: MANAGER quản lý catalog, kho, doanh thu; ẩn isActive=false, không DELETE món có snapshot đơn.
- Health: Terminus GET /health kiểm DB; logging interceptor/filter và cấu hình env.
- Promotion/LoyaltyTransaction: domain mở rộng bắt buộc vẽ theo Task 2.3, chưa có model Prisma/API.

## 4. Migration, env, health/log
API build gồm Prisma generate và seed compilation; start:migrate chạy prisma migrate deploy trước node dist/main. Migration lỗi thì không mở server. Seed runtime là npm run seed, chỉ chủ động nạp demo, không tự seed production.

DATABASE_URL/JWT_* là secret runtime; CORS_ORIGIN/PORT/API_PREFIX là config API. NEXT_PUBLIC_API_URL và chế độ mock là giá trị public nhúng lúc build web; không đưa secret backend vào NEXT_PUBLIC_*. Repo hiện kiểm DATABASE_URL/JWT_SECRET có giá trị, không tự coi đã enforce độ dài secret.

Vercel/Render log phục vụ vận hành. /health DB up không xác nhận DB đã chặn external access; URL HTTP 200 không xác nhận SHA deploy mới, backup hoặc tất cả giao dịch production.

## 5. Lý do, ưu/nhược và trade-off
| Quyết định | Lợi ích | Hạn chế/đánh đổi | ADR |
|---|---|---|---|
| Monorepo web/API/docs | Thống nhất contract và truy vết | Phối hợp branch/PR, build hai ứng dụng | [001](adr/001-monorepo.md) |
| Prisma/migration | Schema/transaction/version DB rõ | Cần backup và migration tương thích khi rollback | [002](adr/002-database-migration.md) |
| JWT và role | Stateless REST, phân quyền | Token ở client, UI chưa tự refresh; cần bảo vệ secret | [003](adr/003-jwt-authentication.md) |
| Payment nội bộ | Demo/test không cần gateway thật | Không xử lý tiền thật | [004](adr/004-mock-payment-service.md) |
| Mobile-first/manifest | Một web cho điện thoại/desktop | Offline/service worker production chưa triển khai, layout 375 còn finding | [005](adr/005-nextjs-pwa-mobile-first.md) |
| Env/health/log | Cấu hình tách code, quan sát DB | Phải kiểm Dashboard/log thật, không suy từ tài liệu | [006](adr/006-healthcheck-logging-config.md) |
| Vercel + Render Git hook | Giữ hosting hiện có, đơn giản | Web/API deploy độc lập; CD chưa build/push app image hoặc xác nhận SHA qua endpoint | [007](adr/007-cicd-and-deployment-strategy.md) |

## 6. Đối chiếu thiết kế → source
[Traceability matrix](../traceability-matrix.md) liên kết FR/NFR tới UML/API/test; [diagram README](../diagrams/README.md) ánh xạ node deployment đến source cụ thể. [Assignment conformance](../requirements/assignment-conformance.md) ghi riêng nội dung tài liệu đã sửa và các điều kiện vận hành chưa có minh chứng.
