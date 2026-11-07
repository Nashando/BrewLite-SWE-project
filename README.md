# ☕ BrewLite - Hệ Thống Đặt Cà Phê Trực Tuyến (Order Ahead & Pickup)

> **Đồ án môn Công nghệ Phần mềm** | Mô hình Monorepo (Next.js PWA + NestJS API + PostgreSQL + Docker)  
> **Repository**: [https://github.com/Nashando/BrewLite-SWE-project](https://github.com/Nashando/BrewLite-SWE-project)

---

## 📌 1. Giới thiệu Dự án

**BrewLite** là ứng dụng web di động hỗ trợ khách hàng đặt trước đồ uống (*Order Ahead*) và đến quầy nhận hàng (*Pickup*) nhằm giảm thiểu thời gian xếp hàng tại cửa hàng cà phê theo phong cách Starbucks. Hệ thống cung cấp trải nghiệm mượt mà cho khách hàng (xem thực đơn, tùy chỉnh size/đường/đá/topping, giỏ hàng, thanh toán mô phỏng an toàn) và màn hình theo dõi, cập nhật trạng thái đơn hàng cho nhân viên quầy.

---

## 🛠️ 2. Bộ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend (`apps/web`)**: Next.js 15 (React 19, TailwindCSS, TanStack React Query, Mobile-first / PWA).
- **Backend (`apps/api`)**: NestJS 10 (TypeScript, RESTful API, JWT Auth Guard, Idempotency, Terminus Health Check).
- **Database**: PostgreSQL 16, Prisma ORM 5 (Migration, Relations & Seeding).
- **DevOps & CI/CD**: Docker & Docker Compose, GitHub Actions (`ci.yml`).
- **Hosting / Cloud**: Vercel Edge (Frontend), Render / Railway (Backend API & PostgreSQL).

---

## 📁 3. Cấu Trúc Monorepo

```text
BrewLite-SWE-project/
├── apps/
│   ├── web/                     # Frontend Next.js PWA
│   └── api/                     # Backend NestJS REST API
├── docs/                        # Tài liệu thiết kế & quy chuẩn đồ án
│   ├── architecture/            # Kiến trúc hệ thống C4 & ADRs
│   │   ├── Architecture Document.md
│   │   └── adr/                 # 6 Bản ghi Quyết định Kiến trúc (ADR 001 -> 006)
│   ├── diagrams/                # Bộ sơ đồ UML (Use-case, Activity, Sequence, Class)
│   ├── issue-board/             # Bảng quản lý User Stories & Tasks Sprint 1, 2
│   ├── screenshots/             # Thư mục lưu trữ ảnh chụp Issue Board offline
│   ├── commit-and-dod.md        # Quy chuẩn Commit & Definition of Done (DoD)
│   └── Deployment Diagram.md    # Sơ đồ triển khai hạ tầng UML
├── .github/workflows/           # CI Pipeline (ci.yml)
├── docker-compose.yml           # Cấu hình môi trường chạy toàn bộ hệ thống ở Local
├── .env.example                 # Mẫu khai báo biến môi trường chuẩn
└── README.md
```

---

## ⚙️ 4. Cấu Hình Biến Môi Trường (.env)

Hệ thống quản lý biến môi trường tập trung thông qua file `.env` tại thư mục gốc. Trước khi khởi chạy, sao chép file mẫu:

```bash
cp .env.example .env
```

### 📋 Bảng tra cứu các biến môi trường chính:

| Nhóm | Tên biến | Giá trị mẫu | Mục đích & Lưu ý |
|---|---|---|---|
| **API** | `PORT` | `3001` | Cổng HTTP của Backend NestJS. |
| **API** | `API_PREFIX` | `/api/v1` | Tiền tố chung cho tất cả các REST API endpoints. |
| **API** | `CORS_ORIGIN` | `http://localhost:3000` | Cấu hình CORS cho phép Frontend truy cập. |
| **DB** | `DATABASE_URL` | `postgresql://brewlite:brewlite@localhost:5432/brewlite?schema=public` | Chuỗi kết nối PostgreSQL dùng cho Prisma & NestJS. |
| **Auth** | `JWT_SECRET` | `brewlite_super_secret_jwt_key_...` | Khóa bí mật ký Access Token (Bắt buộc tối thiểu 32 ký tự). |
| **Auth** | `JWT_EXPIRES_IN` | `1d` | Thời hạn của Access Token. |
| **Auth** | `JWT_REFRESH_SECRET` | `brewlite_super_secret_refresh_key_...` | Khóa bí mật ký Refresh Token (`auth.service.ts`). |
| **Auth** | `JWT_REFRESH_EXPIRES_IN` | `7d` | Thời hạn của Refresh Token. |
| **Order** | `ORDER_PAYMENT_TTL_MINUTES` | `15` | Thời gian chờ thanh toán trước khi đơn hết hạn và tự động hoàn lại tồn kho (`order-expiry.ts`). |
| **Web** | `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` | **BẮT BUỘC có `/api/v1`** để khớp với `API_PREFIX` của Backend. Nếu thiếu tiền tố này, trình duyệt gọi API sẽ trả về lỗi **404 Not Found**. |
| **Web** | `NEXT_PUBLIC_API_MOCKING` | `disabled` | Bật/tắt Mock Service Worker (MSW): `enabled` hoặc `disabled`. |

> ⚠️ **Lưu ý dọn dẹp cấu hình**: Các biến dư thừa không còn sử dụng trong hệ thống như `MOCK_PAYMENT_GATEWAY_URL`, `MOCK_PAYMENT_SECRET`, `APP_NAME`, `NEXT_PUBLIC_APP_NAME` đã được loại bỏ hoàn toàn khỏi `.env.example` để tránh gây nhầm lẫn.

---

## 🚀 5. Hướng Dẫn Cài Đặt & Khởi Chạy Local

### Cách 1: Khởi chạy nhanh bằng Docker Compose (Khuyên dùng)

Yêu cầu: Đã cài đặt **Docker Desktop**.

```bash
# 1. Tạo file .env từ file mẫu
cp .env.example .env

# 2. Build và khởi chạy toàn bộ 3 services (db, api, web)
docker compose up --build
```

- **Frontend Web**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **API Health Check**: [http://localhost:3001/health](http://localhost:3001/health)
- **PostgreSQL Database**: `localhost:5432` (User: `brewlite`, DB: `brewlite`)

---

### Cách 2: Khởi chạy thủ công từng phần (Dành cho Lập trình viên)

Yêu cầu: **Node.js v20+** và cơ sở dữ liệu **PostgreSQL** đang chạy ở cổng 5432.

#### 1. Khởi chạy Database
Nếu dùng Docker chỉ để chạy riêng database:
```bash
docker compose up -d db
```

#### 2. Cài đặt & Khởi chạy Backend (`apps/api`)
```bash
cd apps/api

# Cài đặt thư viện
npm install

# Sinh Prisma Client & chạy migration CSDL
npx prisma generate
npx prisma migrate dev

# Nạp dữ liệu mẫu (Starbucks Menu seed)
npm run prisma:seed

# Khởi chạy API server ở chế độ dev (Port 3001)
npm run start:dev
```

#### 3. Cài đặt & Khởi chạy Frontend (`apps/web`)
```bash
cd apps/web

# Cài đặt thư viện
npm install

# Khởi chạy Next.js dev server (Port 3000)
npm run dev
```

---

## 📋 6. Quy Chuẩn Commit & Definition of Done (DoD)

Dự án áp dụng quy chuẩn phát triển và kiểm soát chất lượng nghiêm ngặt:

- **Conventional Commits**: Định dạng `<type>(scope): <description>` (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- **Quy trình Nhánh**: Mỗi tính năng phát triển trên nhánh riêng (`feature/*` hoặc `TVx`). Không push trực tiếp lên `main`.
- **Ràng buộc CI Bắt buộc (MANDATORY CI - Đề mục 4.4)**:
  - **TUYỆT ĐỐI KHÔNG ĐƯỢC MERGE PULL REQUEST NẾU CI THẤT BẠI (CI FAIL)**.
  - Toàn bộ pipeline kiểm tra tự động trên GitHub Actions (`.github/workflows/ci.yml`) phải đạt **100% Pass**:
    1. **`[api]`**: `npm ci` ➔ `prisma generate` ➔ `npm run lint` ➔ `npm test` ➔ `npm run build`.
    2. **`[web]`**: `npm ci` ➔ `npm run lint` ➔ `npm run typecheck` ➔ `npm test` ➔ `npm run build`.
- **Code Review**: Bắt buộc có ít nhất 01 thành viên khác xem xét và phê duyệt (Approve) PR trước khi merge.

👉 *Xem toàn văn quy định tại*: [docs/commit-and-dod.md](./docs/commit-and-dod.md)

---

## 📊 7. Quản Lý Dự Án & Issue Board (Sprint 1 & Sprint 2)

Do file nén `.zip` nộp bài đồ án không thể chứa cơ sở dữ liệu đám mây của GitHub Projects, nhóm cung cấp đầy đủ liên kết và tài liệu minh chứng:

- 🔗 **GitHub Issues & Project Board trực tuyến**: [https://github.com/Nashando/BrewLite-SWE-project/issues](https://github.com/Nashando/BrewLite-SWE-project/issues)
- 📑 **Tài liệu tổng hợp User Stories & Backlog Sprint 1 & 2**: [docs/issue-board/sprint-backlog.md](./docs/issue-board/sprint-backlog.md)
- 🖼️ **Ảnh chụp màn hình minh chứng Issue Board offline**: Xem tại thư mục [docs/screenshots/](./docs/screenshots/):
  - Sprint 1 Board: `docs/screenshots/sprint-1-board.png`
  - Sprint 2 Board: `docs/screenshots/sprint-2-board.png`

---

## 🔗 8. Danh Mục Tài Liệu Thiết Kế & Yêu Cầu

Toàn bộ tài liệu kỹ thuật được lưu trữ trong thư mục `docs/`:

- 📜 [Đặc tả Use-case & Yêu cầu UC-CHECKOUT](./docs/diagrams/Đặc_tả_Usecase.md)
- 🗺️ [Sơ đồ Use-case Tổng thể Hệ thống](./docs/diagrams/Usecase_Diagram.md)
- 🏗️ [Tài liệu Thiết kế Kiến trúc Hệ thống (Architecture Document - C4 Model)](./docs/architecture/Architecture%20Document.md)
- 📝 [Danh mục 6 Bản ghi Quyết định Kiến trúc (ADRs)](./docs/architecture/adr/)
  - [ADR 001: Cấu trúc Monorepo](./docs/architecture/adr/001-monorepo.md)
  - [ADR 002: Quản lý CSDL & Database Migration](./docs/architecture/adr/002-database-migration.md)
  - [ADR 003: Xác thực Người dùng qua JWT Access/Refresh Token](./docs/architecture/adr/003-jwt-authentication.md)
  - [ADR 004: Dịch vụ Thanh toán Mô phỏng & Idempotency Key](./docs/architecture/adr/004-mock-payment-service.md)
  - [ADR 005: Ứng dụng Web PWA Mobile-first](./docs/architecture/adr/005-nextjs-pwa-mobile-first.md)
  - [ADR 006: Quản lý Cấu hình, Health Check & Logging](./docs/architecture/adr/006-healthcheck-logging-config.md)
- 📊 [Sơ đồ Triển khai Hạ tầng UML (Deployment Diagram)](./docs/Deployment%20Diagram.md)
- 🔄 [Sơ đồ Trình tự Nghiệp vụ Đặt hàng & Thanh toán (Sequence Diagram)](./docs/diagrams/Sequence_Diagram.md)
- 🔁 [Sơ đồ Luồng Hoạt động End-to-End (Activity Diagram)](./docs/diagrams/Activity_Diagram.md)
- 🏛️ [Sơ đồ Lớp Miền Dữ liệu (Domain Class Diagram)](./docs/diagrams/Class_Diagram.md)

---

## 👥 9. Phân Công Thành Viên & Vai Trò Dự Án

| Thành viên | Vai trò | Trách nhiệm chính trong Sprint 1 & Sprint 2 |
|---|---|---|
| **TV1** | Business Analyst (BA) | Khảo sát yêu cầu nghiệp vụ, User Stories, Đặc tả Use-case (`UC-CHECKOUT`). |
| **TV2** | System Analyst (SA) | Thiết kế hệ thống UML (Use-case, Activity, Sequence, Domain Class Diagram). |
| **TV3** | Architect / DevOps | Kiến trúc hệ thống, Docker Compose, CI Pipeline GitHub Actions, Sơ đồ triển khai hạ tầng. |
| **TV4** | Frontend Developer | Phát triển giao diện Next.js PWA, Cart, Checkout Idempotency, tích hợp API thật. |
| **TV5** | Backend Developer | Phát triển NestJS API, Prisma PostgreSQL Schema, Transaction tồn kho, Mock Payment Engine. |
| **TV6** | QA / Tester | Kiểm thử tự động (Jest API, Vitest Frontend), xác minh tính toàn vẹn dữ liệu và DoD. |
