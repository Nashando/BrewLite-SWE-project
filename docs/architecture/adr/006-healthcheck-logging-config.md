# ADR 006: Quản lý Cấu hình qua Biến môi trường, Tích hợp Logging và Endpoint Health Check

* **Ngày**: 2026-10-18
* **Trạng thái**: Accepted
* **Người quyết định**: Architect / DevOps (TV3)

## 1. Bối cảnh (Context)

Ứng dụng Backend NestJS (`apps/api`) cần vận hành trên nhiều môi trường khác nhau (Local Development, CI Pipeline, Cloud Production). Hệ thống đòi hỏi cơ chế quản lý cấu hình an toàn (không làm lộ mật khẩu hoặc chuỗi kết nối DB), ghi vết sự cố (Logging) và cung cấp cơ chế để các dịch vụ Cloud / Container Orchestrator tự động kiểm tra trạng thái hoạt động của ứng dụng.

## 2. Quyết định (Decision)

1. **Quản lý cấu hình qua biến môi trường (Environment Variables)**: Sử dụng `@nestjs/config` để đọc cấu hình từ tệp `.env` ở môi trường local hoặc từ các Secrets được truyền bởi Cloud / GitHub Actions. Cung cấp tệp mẫu `.env.example` trong kho mã nguồn; tuyệt đối không commit tệp `.env` chứa secret thật.
2. **Cung cấp endpoint Health Check (`GET /health`)**: Xây dựng module kiểm tra sức khỏe ứng dụng bằng NestJS Terminus, phản hồi trạng thái hoạt động của HTTP Server và khả năng kết nối tới PostgreSQL Database.
3. **Chuẩn hóa ghi log (Logging)**: Sử dụng Logger mặc định của NestJS hoặc Winston để ghi log theo các cấp độ (`log`, `warn`, `error`), phục vụ việc truy vết sự cố.

## 3. Các phương án đã cân nhắc (Considered Options)

1. **Hardcode cấu hình trong mã nguồn**: Dễ gây rò rỉ thông tin bảo mật và khó thay đổi theo môi trường.
2. **Quản lý cấu hình tập trung qua Env và cung cấp Health Endpoint**: Chuẩn hóa theo tiêu chuẩn 12-Factor App, giúp hệ thống dễ dàng triển khai trên các nền tảng Docker / Cloud.

## 4. Hệ quả & Đánh đổi (Consequences)

* **Ưu điểm**:
  * Bảo vệ thông tin nhạy cảm.
  * Đáp ứng tiêu chí tự động kiểm tra sức khỏe ứng dụng sau khi deploy của pipeline CD và script kiểm thử.
* **Hạn chế (Trade-off)**:
  * Cần khai báo đầy đủ các biến môi trường bắt buộc trong `.env.example` và thiết lập Secrets chính xác trên GitHub Actions / Render.