# Hướng dẫn Triển khai & Vận hành (BrewLite Production)

> **Mô hình hạ tầng:** Vercel (Frontend Next.js tự động deploy qua Git) + Render (Backend API Node Runtime build từ Git qua Deploy Hook + PostgreSQL) + GitHub Actions (CI/CD Quality Gate & Smoke Test).

---

## 1. Truy vết Thành phần & Kiến trúc
| Thành phần | Nền tảng | Đường dẫn mã nguồn | Mục đích (theo ADR) |
|---|---|---|---|
| **Web Client (PWA)** | Vercel | `apps/web` | Frontend Next.js (ADR 005)[cite: 5] |
| **Backend API** | Render Web Service | `apps/api` | NestJS REST API + Mock Payment (ADR 004, 006)[cite: 5] |
| **Database** | Render PostgreSQL | `apps/api/prisma` | PostgreSQL + Prisma Migration (ADR 002)[cite: 5] |
| **CI/CD Pipeline** | GitHub Actions / GHCR | `.github/workflows/` | Tự động hóa Lint, Test, Đóng gói Image & Deploy[cite: 6, 7] |

*Sơ đồ chi tiết:* `docs/diagrams/deployment-diagram.svg` (hoặc `.puml`).

---

## 2. Môi trường Local vs. Production
| Tiêu chí | Môi trường Local | Môi trường Production |
|---|---|---|
| **Khởi chạy** | `docker compose up --build` | GitHub Actions Tag Push (`vX.Y.Z`) + Render Deploy Hook |
| **Database** | Container Docker local (`5432`) | Render PostgreSQL (Private Network) |
| **Biến môi trường** | File `.env` | GitHub Secrets & Cloud Environment Variables[cite: 6] |
| **Dữ liệu** | Dữ liệu Seed demo[cite: 6] | Dữ liệu thực tế / Demo tuỳ chọn |

---

## 3. Cấu hình Vận hành Nhanh (Làm một lần trước Release)

### 3.1. Render (Backend & Database)
1. Tạo **PostgreSQL** trên Render $\rightarrow$ Lấy **Internal Database URL** làm `DATABASE_URL`.
2. Tạo **Web Service** trên Render, kết nối tới repository GitHub, chọn root directory hoặc thư mục API, cấu hình build command (`npm install && npm run build`) và start command (`npm run start:migrate`).
3. Cài đặt các Environment Variables quan trọng trên Render:
   - `DATABASE_URL`: Internal URL kết nối PostgreSQL nội bộ.
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`: Khóa bảo mật ngẫu nhiên (tối thiểu 32 ký tự).
   - `CORS_ORIGIN`: URL Web trên Vercel (`https://brewlite-swe-project-web.vercel.app`).
   - `PORT`: `3001` (hoặc cổng do Render chỉ định).
4. Vào mục **Settings > Deploy Hook** để tạo và lưu lại **Deploy Hook URL**.

### 3.2. Vercel (Frontend)
1. Import repository lên Vercel, chọn **Root Directory** là `apps/web`[cite: 6].
2. Cài đặt Environment Variables:
   - `NEXT_PUBLIC_API_URL`: URL API Render (`https://brewlite-swe-project.onrender.com`).
   - `NEXT_PUBLIC_API_MOCKING`: `disabled`.
3. Vercel tự động liên kết với GitHub qua Git Integration: khi có commit mới được merge vào nhánh `main`, Vercel sẽ tự động kích hoạt build và deploy bản mới nhất.

### 3.3. GitHub Settings (`production` Environment)
Vào **Settings > Environments > production** và cấu hình Secret:
- **Secrets:** `RENDER_DEPLOY_HOOK_URL` (URL deploy hook lấy từ Render ở bước 3.1).

*(Lưu ý: Pipeline GitHub Actions tự động sử dụng `GITHUB_TOKEN` có sẵn để xác thực. Nếu có cấu hình đóng gói image lên GitHub Container Registry (GHCR), đó là minh chứng kỹ thuật bổ sung chứ không tham gia trực tiếp vào tiến trình deploy Runtime của Render).*

---

## 4. Quy trình Phát hành (Release & CD)
1. Kiểm tra toàn bộ mã nguồn trên nhánh tính năng hoặc PR, đảm bảo **CI đạt 100% Pass**.
2. Merge code hoàn chỉnh vào nhánh `main`. (Vercel sẽ tự động cập nhật Frontend).
3. Gắn Git Tag phiên bản semver trên `main` và đẩy lên GitHub để kích hoạt pipeline CD:
   ```bash
   git checkout main && git pull
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

---

## 5. Hướng dẫn Rollback & Khắc phục sự cố Production

Khi phiên bản phát hành mới gặp sự cố nghiêm trọng trên môi trường Production, thực hiện rollback theo các bước dưới đây:

1. **API (Render):** 
   - Mở dịch vụ API trên Render Dashboard $\rightarrow$ chuyển sang tab **Deploys** (lịch sử deploy).
   - Chọn bản deploy ổn định trước đó và tiến hành redeploy/rollback.
   - Sau khi hoàn tất, kiểm tra nhanh các endpoint `/health` và `/products` để đảm bảo API hoạt động trở lại.

2. **Web (Vercel):** 
   - Mở project trên Vercel Dashboard $\rightarrow$ vào trang **Deployments**.
   - Tìm đến deployment ổn định trước đó $\rightarrow$ chọn **Promote to Production** (hoặc *Instant Rollback*).
   - Kiểm tra lại giao diện trang `/menu` và khả năng gọi API từ phía client.

3. **Database:** 
   - Việc rollback ứng dụng **không tự động hoàn tác (revert) các migration** của cơ sở dữ liệu. 
   - Ưu tiên hàng đầu là sửa lỗi bằng cách tung ra một migration mới tương thích ngược. 
   - Chỉ khôi phục database từ bản backup khi đã đánh giá kỹ lưỡng ảnh hưởng và chấp nhận mất dữ liệu phát sinh sau thời điểm backup. **Cấm tuyệt đối** sử dụng lệnh `prisma migrate reset` trên môi trường Production.

4. **Xác minh sau Rollback:** 
   - Kiểm tra kỹ health check, tính năng đăng nhập và toàn bộ luồng đặt hàng/thanh toán (Order & Checkout).
   - Theo dõi sát sao log API trên Render Dashboard để đảm bảo không còn lỗi phát sinh.

> **Lưu ý quan trọng:** Nếu bản phát hành đã chạy migration, hãy xác nhận phiên bản ứng dụng cũ được redeploy hoàn toàn tương thích với schema hiện tại trước khi thực hiện.