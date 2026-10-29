# ADR 001: Sử dụng Cấu trúc Monorepo cho Dự án BrewLite

* **Ngày**: 2026-10-18
* **Trạng thái**: Accepted
* **Người quyết định**: Architect / DevOps (TV3)

## 1\. Bối cảnh (Context)

Dự án BrewLite bao gồm ứng dụng Frontend (Next.js) và ứng dụng Backend (NestJS). Nhóm cần lựa chọn phương án quản lý mã nguồn phù hợp để đảm bảo tính đồng bộ, dễ chia sẻ cấu hình CI/CD và quy ước phát triển.

## 2\. Quyết định (Decision)

Sử dụng cấu trúc **Monorepo** với các thư mục chính:

* `apps/web`: Mã nguồn Next.js Frontend.
* `apps/api`: Mã nguồn NestJS Backend.
* `docs/`: Tài liệu dự án.

## 3\. Các phương án đã cân nhắc (Considered Options)

1. **Multirepo** (Tách `brewlite-web` và `brewlite-api` thành 2 repository riêng biệt).
2. **Monorepo** (Gộp tất cả vào 1 repository duy nhất).

## 4\. Hệ quả &amp; Đánh đổi (Consequences)

* **Ưu điểm**:
  * Quản lý tập trung trên một Issue Board và Pull Request.
  * Đồng bộ quy trình CI/CD và tài liệu trong cùng một phiên bản.
  * Dễ chia sẻ các cấu hình dùng chung (ESLint, Prettier, TypeScript config).
* **Hạn chế (Trade-off)**:
  * Kích thước Repository lớn hơn.
  * Cần cấu hình script CI/CD khéo léo để nhận biết thay đổi theo từng ứng dụng trong monorepo.