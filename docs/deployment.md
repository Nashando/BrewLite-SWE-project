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
   - `DATABASE_URL`: Internal URL kết nối PostgreSQL nội bộ.
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`: Khóa bảo mật ngẫu nhiên (tối thiểu 32 ký tự).
   - `CORS_ORIGIN`: URL Web trên Vercel (`https://brewlite-swe-project-web.vercel.app`).
   - `PORT`: `3001` (hoặc cổng do Render chỉ định).
4. Vào mục **Settings > Deploy Hook** để tạo và lưu lại **Deploy Hook URL**.

### 3.2. Vercel (Frontend)
1. Import repository lên Vercel, chọn **Root Directory** là `apps/web`.
2. Cài đặt Environment Variables:
   - `NEXT_PUBLIC_API_URL`: URL API Render (`https://brewlite-swe-project.onrender.com`).
   - `NEXT_PUBLIC_API_MOCKING`: `disabled`.
3. Vercel tự động liên kết với GitHub qua Git Integration: khi có commit mới được merge vào nhánh `main`, Vercel sẽ tự động kích hoạt build và deploy bản mới nhất.

### 3.3. GitHub Settings (`production` Environment)
Vào **Settings > Environments > production** và cấu hình Secret:
- **Secrets:** `RENDER_DEPLOY_HOOK_URL` (URL deploy hook lấy từ Render ở bước 3.1).

*(Lưu ý: Pipeline CD tự động sử dụng `GITHUB_TOKEN` có sẵn để xác thực và push image lên GHCR, không cần thêm token bên ngoài).*

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
4. Pipeline CD (`.github/workflows/cd.yml`) sẽ tự động thực hiện:
   - **Quality Gate:** Tái sử dụng pipeline CI để kiểm tra Lint, Test, Typecheck và Build.
   - **Docker Build & Push:** Đóng gói container API và push lên GitHub Container Registry (GHCR).
   - **Deploy API:** Gọi Render Deploy Hook để Render kéo image mới và khởi động lại.
   - **Smoke Test:** Đợi Render hoàn tất triển khai và tự động kiểm tra tính sẵn sàng của hệ thống.

---

## 5. Kiểm Thử Tự Động Sau Triển Khai (Smoke Test)
Sau khi Deploy Hook được kích hoạt, pipeline CD tự động thực hiện kiểm tra các endpoint sau:

1. **API Health Check**: `GET https://brewlite-swe-project.onrender.com/health`
   - Đảm bảo API server và kết nối cơ sở dữ liệu PostgreSQL hoạt động tốt (phản hồi HTTP 200).
2. **API Product Listing**: `GET https://brewlite-swe-project.onrender.com/products`
   - Đảm bảo tầng dữ liệu và truy vấn thực đơn hoạt động chính xác (HTTP 200).
3. **Frontend Menu Screen**: `GET https://brewlite-swe-project-web.vercel.app/menu`
   - Đảm bảo ứng dụng Next.js trên Vercel phản hồi trang thực đơn thành công (HTTP 200).

---

## 6. Quản Lý Cơ Sở Dữ Liệu & Migration Trên Production
- **Cơ chế tự động:** Khi container API khởi chạy trên Render, lệnh `npm run start:migrate` (`prisma migrate deploy && node dist/main`) sẽ tự động áp dụng các migration mới nhất vào cơ sở dữ liệu trước khi server lắng nghe request.
- **Quy tắc an toàn dữ liệu:**
  - Không chạy lệnh `prisma db push` hoặc `prisma migrate dev` trên môi trường Production.
  - Pipeline tuyệt đối **không tự động chạy seed** trên Production để tránh ghi đè dữ liệu thực tế.
  - Nếu cần nạp dữ liệu menu mẫu lần đầu trên Production, lập trình viên có thể kết nối nội bộ hoặc chạy thủ công qua Render Shell: `npm run prisma:seed`.

---

## 7. Giám Sát, Logging & Lưu ý Vận Hành
- **Xem Log Backend:** Truy cập Render Dashboard $\rightarrow$ Web Service `brewlite-api` $\rightarrow$ Tab **Logs** để theo dõi log HTTP request và truy vết ngoại lệ.
- **Xem Log Frontend:** Truy cập Vercel Dashboard $\rightarrow$ Project `brewlite-web` $\rightarrow$ Tab **Logs** để kiểm tra runtime logs.
- **Đặc thù gói miễn phí (Free Tier):**
  - Web Service trên Render có thể chuyển sang trạng thái ngủ (spin-down) sau một thời gian không có lưu lượng truy cập. Request đầu tiên sau thời gian nghỉ có thể mất khoảng 50 - 60 giây để máy chủ khởi động lại (Cold Start).
  - PostgreSQL miễn phí trên Render có thời hạn 30 ngày; cần lưu ý kế hoạch sao lưu hoặc nâng cấp trước khi hết hạn.

---

## 8. Quy trình Rollback & Khắc Phục Sự Cố
Khi phiên bản phát hành mới gặp sự cố nghiêm trọng trên môi trường Production, thực hiện rollback theo các bước dưới đây:

### 8.1. Rollback Nhanh Backend API (Render)
- **Cách 1 - Qua giao diện Render (Khuyên dùng):**
  1. Đăng nhập Render Dashboard $\rightarrow$ Chọn Web Service `brewlite-api`.
  2. Vào mục **Deploys**.
  3. Tìm bản build / deploy ổn định gần nhất trước đó.
  4. Bấm vào biểu tượng menu `...` $\rightarrow$ Chọn **Rollback to this deploy**. Render sẽ lập tức khôi phục lại phiên bản container cũ.
- **Cách 2 - Qua Git Tag:**
  1. Trigger lại Deploy Hook với image tag của phiên bản ổn định trước đó (ví dụ image của tag `v0.9.0` hoặc commit SHA trước đó trên GHCR).

### 8.2. Rollback Nhanh Frontend (Vercel)
1. Đăng nhập Vercel Dashboard $\rightarrow$ Chọn Project `brewlite-web`.
2. Vào tab **Deployments**.
3. Tìm bản deployment gần nhất chạy ổn định.
4. Bấm vào biểu tượng menu `...` bên cạnh bản deployment đó $\rightarrow$ Chọn **Instant Rollback**. Vercel sẽ chuyển hướng 100% traffic về bản phát hành này ngay lập tức.

### 8.3. Xử lý Dữ liệu Cơ sở Dữ liệu khi Rollback
- Do các migration của Prisma được áp dụng theo trình tự tiến tính, nếu phiên bản lỗi có chứa migration phá vỡ:
  1. Tạo một migration mới (revert migration) bằng code để hoàn tác các cột/bảng bị lỗi.
  2. Tạo bản hotfix và đẩy qua quy trình release chuẩn để áp dụng lại.
  3. Không tự ý xoá hay chỉnh sửa trực tiếp các bản ghi trong bảng `_prisma_migrations` của Production database.