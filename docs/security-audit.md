# Biên bản kiểm tra secret không lộ trong repository và log CI

- **Dự án:** BrewLite (Assignment 2, Task 5.4)
- **Người thực hiện:** Trung Hieu (Architect / DevOps)
- **Người review:** Team Reviewer
- **Phạm vi:** mã nguồn trong repository, cấu hình workflow, Dockerfile, log của GitHub Actions, cấu hình nền tảng triển khai.
- **Ngày kiểm tra bản mã nguồn:** 2026-11-07 (bản `BrewLite-SWE-project`)
- **Ngày kiểm tra sau deploy:** 2026-11-07

## 1. Kiểm tra tự động trên mã nguồn

Công cụ: `bash scripts/secret-audit.sh` (chạy trong git repository) và workflow `secret-scan.yml` (gitleaks, quét toàn bộ lịch sử commit).

| # | Hạng mục | Kết quả |
|---|---|---|
| 1 | Không có file `.env` thật nào được commit | PASS |
| 2 | `.gitignore` chặn file `.env` | PASS |
| 3 | Không có khoá/token dạng AWS, GitHub, Slack, private key trong mã nguồn | PASS |
| 4 | Không có chuỗi kết nối DB kèm mật khẩu trỏ ra ngoài (chỉ localhost, `db`, biến môi trường) | PASS |
| 5 | Workflow không `echo` secret, không bật `set -x` hay `printenv` | PASS |
| 6 | Workflow chỉ lấy secret từ `secrets.*` | PASS |
| 7 | Dockerfile không nhúng SECRET/PASSWORD/TOKEN qua `ARG`/`ENV` | PASS |
| 8 | `.env.example` chỉ chứa giá trị mẫu | PASS |

Kết quả `secret-audit.sh`: đạt 8/8 hạng mục trên bản mã nguồn ngày 2026-11-07.
Script đã được thử trên một bản sao có cài sẵn secret giả và phát hiện đủ các nhóm lỗi, nên kết quả PASS ở trên có ý nghĩa.

- Kết quả gitleaks (lịch sử đầy đủ): 0 phát hiện lộ secret (Passed)

## 2. Kiểm tra thủ công sau khi triển khai

Đánh dấu ☑ khi đã kiểm tra và ghi minh chứng.

| # | Hạng mục | Đã kiểm tra | Minh chứng |
|---|---|---|---|
| 1 | Log của lượt chạy CD không hiển thị giá trị secret (Deploy Hook, token, `DATABASE_URL`, `JWT_*`). Secret hiển thị dạng `***` | ☑ | GitHub Actions Logs |
| 2 | Log của lượt chạy CI không hiển thị secret | ☑ | GitHub Actions Logs |
| 3 | Secret chỉ nằm trong GitHub Environment `production`, Render env vars, Vercel env vars; không có trong repository | ☑ | Cấu hình Cloud Dashboard |
| 4 | `JWT_SECRET` và `JWT_REFRESH_SECRET` trên production là chuỗi ngẫu nhiên ≥ 32 ký tự, khác giá trị mẫu trong `.env.example` | ☑ | Đã cấu hình trên Render |
| 5 | Render PostgreSQL không bật truy cập bên ngoài (chỉ dùng Internal URL) | ☑ | Render Database Settings |
| 6 | Image trên GHCR không chứa secret: `docker history --no-trunc ghcr.io/nashando/brewlite-api:1.0.0` không có giá trị bí mật | ☑ | Kiểm tra local Docker |
| 7 | Bundle web production không chứa secret: chỉ có các biến `NEXT_PUBLIC_*` (URL công khai) | ☑ | Vercel Build Logs |
| 8 | Biến `CORS_ORIGIN` trên production đặt đúng URL web (`https://brewlite-swe-project-web.vercel.app`) | ☑ | Render Env Vars[cite: 8] |
| 9 | Tài khoản quản lý/nhân viên từ seed demo đã được kiểm soát an toàn trên production | ☑ | Seed policy áp dụng |
| 10 | Không có token hay thông tin nhạy cảm nào bị dán nhầm vào chat hoặc commit công khai | ☑ | Clean Git History |

## 3. Ghi nhận và khuyến nghị

| Mức | Nội dung | Xử lý |
|---|---|---|
| Lưu ý | `apps/api/prisma/seed.ts` tạo tài khoản MANAGER/STAFF/CUSTOMER với mật khẩu mẫu | Pipeline **không** chạy seed tự động trên production để đảm bảo an toàn |
| Lưu ý | `apps/web/src/mocks/handlers.ts` có dữ liệu giả lập | Chỉ dùng cho mock MSW khi phát triển, không ảnh hưởng production (`NEXT_PUBLIC_API_MOCKING=disabled`)[cite: 6] |
| Lưu ý | Cấu hình `CORS_ORIGIN` trên production đã được trỏ trực tiếp về domain Vercel | Đảm bảo tính bảo mật cho API, chỉ cho phép web client của nhóm truy cập |
| Thông tin | `.env.example` chứa giá trị mẫu `change-me-...` | Placeholder cho môi trường local, được cho phép trong `.gitleaks.toml` |

## 4. Kết luận

Không phát hiện secret nào bị lộ trong repository và log CI/CD tại thời điểm kiểm tra. Hệ thống cấu hình biến môi trường an toàn trên các nền tảng Vercel và Render.

- **Người thực hiện:** Trung Hieu — **Ngày:** 2026-11-07
- **Người review:** Team Reviewer — **Ngày:** 2026-11-07