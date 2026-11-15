# ADR 007 — Render Node runtime từ Git và CD hiện trạng

## Trạng thái
Làm rõ tài liệu ngày 15/11/2026 theo source 9808d37. Không xác nhận lại Dashboard hoặc ghi nhận đã triển khai thay đổi mới chỉ vì sửa ADR.

## Bối cảnh/phương án
Có thể triển khai API từ image registry hoặc build trực tiếp từ Git. Cấu hình tài liệu repo đang chọn Render Node runtime + Deploy Hook, Vercel Git Integration và PostgreSQL Render. Dockerfiles/Compose phục vụ local; payment chạy nội bộ API.

## Quyết định đang phản ánh trong source
- Web: Vercel build main qua Git Integration.
- API: CD gọi Render Deploy Hook với ref=GITHUB_SHA; Render Node runtime build Git source. Start command là npm run start:migrate.
- CD main chỉ có quality → deploy-api → smoke-test. quality tái sử dụng CI lint/test/build.
- CD không có job Docker build/tag/push GHCR. IMAGE_NAME hoặc comment về image còn trong YAML không phải executable job. Không khẳng định image SHA/semver đã được tạo hoặc Render đang pull GHCR.
- Registry base image trong repo là Docker Hub (node:22-alpine, postgres:16-alpine). Yêu cầu app-image/registry Task 5.3 còn cần triển khai và run thật, không được hợp thức hóa bằng sơ đồ.
- Hook HTTP thành công nghĩa là đã yêu cầu deploy. Smoke hiện kiểm health/products/menu; chưa xác nhận API/web đang phục vụ SHA yêu cầu. Required checks main cũng là thiết lập GitHub phải kiểm riêng.

## Hệ quả/trade-off
Git runtime đơn giản và giữ URL; web/API deploy độc lập, phải xác minh phiên bản và migration trên nền tảng. Quy trình hiện chưa đáp ứng trọn chuỗi image/tag/registry của Task 5.3. Khi thực sự bổ sung pipeline đó cần đồng bộ ADR/diagram và lưu digest/run; không mô tả kế hoạch thành hiện trạng.

## Migration/rollback
Migration chạy trước API start; rollback ứng dụng không tự hoàn tác schema/dữ liệu. Xem [deployment mục 5](../../deployment.md). Không dùng migrate reset production.

## Nguồn sở hữu
[cd.yml](../../../.github/workflows/cd.yml), [CI](../../../.github/workflows/ci.yml), [Docker API](../../../apps/api/Dockerfile), [Compose](../../../docker-compose.yml).
