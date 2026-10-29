# ADR 002: Sử dụng Cơ chế Database Migration cho Cơ sở Dữ liệu PostgreSQL

* **Ngày**: 2026-10-18
* **Trạng thái**: Accepted
* **Người quyết định**: Architect / DevOps (TV3)

## 1\. Bối cảnh (Context)

Dự án BrewLite sử dụng cơ sở dữ liệu quan hệ PostgreSQL để lưu trữ thông tin người dùng, thực đơn, giỏ hàng, đơn hàng và các giao dịch thanh toán. Trong quá trình phát triển qua từng Sprint và khi triển khai lên môi trường Production, cấu trúc cơ sở dữ liệu (Schema) sẽ liên tục được mở rộng và thay đổi. Nhóm cần một phương án quản lý sự thay đổi này có kiểm soát phiên bản (version control), đảm bảo đồng bộ cấu trúc dữ liệu giữa các môi trường (Local, CI, Production) mà không làm thất thoát dữ liệu hiện có.

## 2\. Quyết định (Decision)

Sử dụng **Cơ chế Database Migration** (kết hợp với ORM như Prisma/TypeORM) trong ứng dụng Backend NestJS (`apps/api`):

* Toàn bộ thay đổi về cấu trúc bảng/cột phải được ghi nhận thành các file migration có đánh số phiên bản trong thư mục `apps/api/prisma/migrations` và được lưu vết trên Git.
* Cung cấp script khởi tạo dữ liệu mẫu (`seed.ts`) để dễ dàng nạp dữ liệu ban đầu cho việc phát triển và kiểm thử ở local.
* Tự động hóa việc chạy migration trong pipeline CD (`.github/workflows/cd.yml`) khi triển khai lên môi trường Production.

## 3\. Các phương án đã cân nhắc (Considered Options)

1. **Sửa trực tiếp bằng SQL thủ công (Manual SQL Scripts)**: Cập nhật CSDL bằng cách chạy lệnh SQL trực tiếp trên phần mềm quản trị CSDL.
2. **Đồng bộ tự động từ Entity (Auto-sync/DB Push)**: Cho phép ORM tự động chỉnh sửa bảng theo code Entity mà không tạo file migration.
3. **Database Migration có quản lý phiên bản (Version-controlled Migration)**: Sử dụng các tệp script migration được sinh ra theo trình tự thời gian.

## 4\. Hệ quả &amp; Đánh đổi (Consequences)

* **Ưu điểm**:
  * Đảm bảo tính nhất quán và khả năng tái tạo (reproducible) cơ sở dữ liệu trên mọi môi trường phát triển và Production.
  * Tích hợp mượt mà vào quy trình CI/CD để tự động cập nhật CSDL khi deploy phiên bản mới.
  * Lưu lại lịch sử thay đổi cấu trúc bảng, giúp dễ dàng truy vết hoặc rollback khi gặp sự cố.
* **Hạn chế (Trade-off)**:
  * Lập trình viên phải tuân thủ quy trình tạo migration mỗi khi thay đổi model/entity, tuyệt đối không chỉnh sửa trực tiếp DB bằng công cụ GUI.
  * Cần cẩn trọng xử lý các migration chứa thay đổi phá vỡ (breaking changes) như xóa cột hoặc đổi tên bảng để tránh làm mất dữ liệu Production.