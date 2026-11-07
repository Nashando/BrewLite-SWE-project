# Hướng dẫn Triển khai & Vận hành (BrewLite Production)

> **Mô hình hạ tầng:** Vercel (Frontend) + Render (Backend API từ Docker Image + PostgreSQL) + GitHub Actions & GHCR (CI/CD).

---

## 1. Truy vết Thành phần & Kiến trúc
| Thành phần | Nền tảng | Đường dẫn mã nguồn | Mục đích (theo ADR) |
|---|---|---|---|
| **Web Client (PWA)** | Vercel | `apps/web` | Frontend Next.js (ADR 005) |
| **Backend API** | Render Web Service | `apps/api` | NestJS REST API + Mock Payment (ADR 004, 006) |
| **Database** | Render PostgreSQL | `apps/api/prisma` | PostgreSQL + Prisma Migration (ADR 002) |
| **CI/CD Pipeline** | GitHub Actions / GHCR | `.github/workflows/` | Tự động hóa Build & Deploy |

*Sơ đồ chi tiết:* `docs/Deployment Diagram.md` (đã xuất file `.svg`).

---

## 2. Môi trường Local vs. Production
| Tiêu chí | Môi trường Local | Môi trường Production |
|---|---|---|
| **Khởi chạy** | `docker compose up --build` | GitHub Actions Tag Push (`vX.Y.Z`) |
| **Database** | Container Docker local (`5432`) | Render PostgreSQL (Private Network) |
| **Biến môi trường** | File `.env` | GitHub Secrets & Cloud Environment Variables |
| **Dữ liệu** | Dữ liệu Seed demo | Dữ liệu thật / Demo tuỳ chọn |

---

## 3. Cấu hình Vận hành Nhanh (Làm một lần trước Release)

### 3.1. Render (Backend & Database)
1. Tạo **PostgreSQL** trên Render $\rightarrow$ Lấy **Internal Database URL** làm `DATABASE_URL`.
2. Tạo **Web Service** (chọn *Existing Image*, trỏ tới image trên GHCR).
3. Cài đặt các Environment Variables quan trọng trên Render:
   - `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` (URL Vercel).
4. Lưu lại **Deploy Hook URL** và **Service ID**.

### 3.2. Vercel (Frontend)
1. Import project lên Vercel, chọn **Root Directory** là `apps/web`.
2. Cài đặt Environment Variables: `NEXT_PUBLIC_API_URL` (URL Render API).
3. Lấy `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` để cấu hình GitHub Secrets.

### 3.3. GitHub Settings (`production` Environment)
Vào **Settings > Environments > production** và thêm vào các giá trị:
- **Secrets:** `RENDER_DEPLOY_HOOK_URL`, `RENDER_API_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- **Variables:** `RENDER_SERVICE_ID`, `PRODUCTION_API_URL`, `PRODUCTION_WEB_URL`.

---

## 4. Quy trình Phát hành (Release & CD)
1. Merge code hoàn chỉnh vào nhánh `main`.
2. Gắn Git Tag phiên bản và đẩy lên GitHub để kích hoạt pipeline tự động:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0