# ☕ BrewLite - Hệ Thống Đặt Cà Phê Trực Tuyến (Order Ahead & Pickup)

> **Đồ án môn Công nghệ Phần mềm** | Mô hình Monorepo (Next.js + NestJS + PostgreSQL + Docker)

---

## 📌 1. Giới thiệu Dự án

**BrewLite** là ứng dụng web di động hỗ trợ khách hàng đặt trước đồ uống (*Order Ahead*) và đến quầy nhận hàng (*Pickup*) nhằm giảm thời gian xếp hàng tại cửa hàng cà phê. Hệ thống cung cấp giao diện mượt mà cho khách hàng và màn hình quản lý đơn hàng thời gian thực (real-time) cho nhân viên quầy.

---

## 🛠️ 2. Bộ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend (`apps/web`)**: Next.js (React, TailwindCSS, Mobile-first / PWA).
- **Backend (`apps/api`)**: NestJS (TypeScript, RESTful API, WebSocket).
- **Database**: PostgreSQL, Prisma ORM (Migration & Seed).
- **DevOps & CI/CD**: Docker & Docker-Compose, GitHub Actions, GHCR.
- **Hosting / Cloud**: Vercel (Frontend), Render / Railway (Backend & DB).

---

## 📁 3. Cấu Trúc Monorepo

```text
brewlite/
├── apps/
│   ├── web/                # Frontend Next.js PWA
│   └── api/                # Backend NestJS REST API
├── docs/                   # Tài liệu thiết kế & quy chuẩn
│   ├── requirements/       # Yêu cầu (SRS, Context & Scope)
│   ├── architecture/       # Kiến trúc & bản ghi ADRs
│   ├── diagrams/           # Sơ đồ UML
│   ├── commit-and-dod.md   
│   └── deployment.md       
├── .github/workflows/      # CI/CD Pipelines (ci.yml, cd.yml)
├── docker-compose.yml      # Cấu hình môi trường local
├── .env.example            # Mẫu khai báo biến môi trường
└── README.md
```

---

## 🚀 4. Hướng Dẫn Cài Đặt & Khởi Chạy Local

### Yêu cầu tiên quyết

- Node.js (v20.x trở lên) & `npm`
- Docker Desktop (nếu chạy qua Docker)
- PostgreSQL (nếu không dùng Docker)

### Các bước thực hiện

*(Sẽ cập nhật chi tiết các bước cài đặt sau khi hoàn thành xong phần cấu trúc mã nguồn Backend/Frontend)*

---

## 📋 5. Quy Chuẩn Commit & Definition of Done (DoD)

Dự án áp dụng quy chuẩn phát triển chặt chẽ cho tất cả các thành viên:

- **Conventional Commits**: Định dạng `type(scope): description` (`feat:`, `fix:`, `docs:`, `chore:`, `test:`...).
- **Quy trình Nhánh**: Phát triển trên nhánh thành viên, gộp code qua Pull Request (PR).
- **DoD**: PR chỉ được merge khi vượt qua 4 bước CI (Install -> Lint -> Test -> Build) và được Reviewer tương ứng bấm Approve.

👉 *Xem toàn văn quy định tại*: [docs/commit-and-dod.md](./docs/commit-and-dod.md)

---

## 🔗 6. Danh Mục Tài Liệu Thiết Kế & Yêu Cầu

- 📜 [Tài liệu Đặc tả Yêu cầu (SRS)](./docs/requirements/srs.md)
- 🏗️ [Tài liệu Mô tả Kiến trúc (Architecture)](./docs/architecture/architecture.md)
- 📊 [Sơ đồ Triển khai UML (Deployment Diagram)](./docs/diagrams/deployment.puml)
- 📝 [Danh sách Bản ghi Quyết định Kiến trúc (ADRs)](./docs/architecture/adr/)

---

## 🌐 7. Đường Dẫn Triển Khai Production (Cloud)

- **Frontend App**: `<URL triển khai Frontend>` *(Cập nhật ở Task 5.4)*
- **Backend API**: `<URL triển khai Backend>` *(Cập nhật ở Task 5.4)*
- **Endpoint Health Check**: `<URL Health Check>` *(Cập nhật ở Task 5.4)*

---

## 👥 8. Thành Viên Nhóm & Phân Công Vai Trò

| Thành viên | Vai trò | Nhiệm vụ chính |
|---|---|---|
| **TV1** | Business Analyst (BA) | Khảo sát yêu cầu, tài liệu SRS, User Stories |
| **TV2** | System Analyst (SA) | Thiết kế Sơ đồ Use-case, Activity & Sequence Diagram |
| **TV3** | Architect / DevOps | Kiến trúc hệ thống, Docker, CI/CD Pipeline, Deployment |
| **TV4** | Frontend Developer | Phát triển giao diện Next.js, Mobile-first / PWA UI |
| **TV5** | Backend Developer | Phát triển NestJS API, PostgreSQL Schema, Auth JWT, Payment |
| **TV6** | QA / Tester | Kiểm thử tự động (Unit/E2E), Docker-compose, Release |
