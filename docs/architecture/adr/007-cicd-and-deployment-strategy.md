# ADR 007 — Render Node runtime từ Git và CD hiện trạng

## Trạng thái
Làm rõ tài liệu ngày 15/11/2026 theo source 9808d37; cập nhật cùng ngày khi bổ sung job `image` vào cd.yml (PR TV6). Không xác nhận lại Dashboard hoặc ghi nhận đã triển khai thay đổi mới chỉ vì sửa ADR.

## Bối cảnh/phương án
Có thể triển khai API từ image registry hoặc build trực tiếp từ Git. Cấu hình tài liệu repo đang chọn Render Node runtime + Deploy Hook, Vercel Git Integration và PostgreSQL Render. Dockerfiles/Compose phục vụ local; payment chạy nội bộ API.

## Quyết định đang phản ánh trong source
- Web: Vercel build main qua Git Integration.
- API: CD gọi Render Deploy Hook với ref=GITHUB_SHA; Render Node runtime build Git source. Start command là npm run start:migrate.
- CD: quality → image → deploy-api → smoke-test, cộng job rollback-guide chỉ chạy khi có job lỗi. quality tái sử dụng CI lint/test/build.
- Job `image` build Docker image từ `apps/api/Dockerfile`, gắn tag `X.Y.Z` và `sha-<commit>`, push lên `ghcr.io/nashando/brewlite-api` bằng `GITHUB_TOKEN`.
- Mặc định Render vẫn build Node runtime từ Git đúng commit của image (ref=SHA). Biến repo `RENDER_DEPLOY_FROM_IMAGE=true` chuyển sang gửi `imgURL` khi service Render được cấu hình chạy từ image. Đề cho phép "push registry nếu nền tảng yêu cầu"; image vẫn được push để có artifact có phiên bản cho truy vết/rollback.
- Registry base image trong repo là Docker Hub (node:22-alpine, postgres:16-alpine).
- Hook HTTP thành công nghĩa là đã yêu cầu deploy. Smoke kiểm health có database up, products không rỗng, web menu; chưa xác nhận API/web đang phục vụ SHA yêu cầu. Required checks main là thiết lập GitHub phải kiểm riêng.

## Hệ quả/trade-off
Git runtime đơn giản và giữ URL; web/API deploy độc lập, phải xác minh phiên bản và migration trên nền tảng. Image GHCR và runtime Render được build riêng từ cùng commit, nên artifact giống về source nhưng không phải cùng một binary trừ khi bật deploy từ image. Minh chứng Task 5.3 là run CD thật của tag mới (log job `image` có digest); YAML không tự chứng minh đã chạy.

## Migration/rollback
Migration chạy trước API start; rollback ứng dụng không tự hoàn tác schema/dữ liệu. Xem [deployment mục 5](../../deployment.md). Không dùng migrate reset production.

## Nguồn sở hữu
[cd.yml](../../../.github/workflows/cd.yml), [CI](../../../.github/workflows/ci.yml), [Docker API](../../../apps/api/Dockerfile), [Compose](../../../docker-compose.yml).
