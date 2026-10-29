# ADR 005: Phát triển Frontend Next.js theo Hướng Mobile-first và Progressive Web App (PWA)

* **Ngày**: 2026-10-18
* **Trạng thái**: Accepted
* **Người quyết định**: Architect / DevOps (TV3)

## 1\. Bối cảnh (Context)

Nghiệp vụ đặt cà phê BrewLite (theo mô hình Starbucks) hướng tới khách hàng đặt đồ uống nhanh trên thiết bị di động khi đang di chuyển để đến quầy nhận đồ (Order Ahead &amp; Pickup). Hệ thống đòi hỏi giao diện tối ưu cho màn hình nhỏ, tốc độ phản hồi nhanh và khả năng truy cập mượt mà như một ứng dụng di động bản địa (Native App).

## 2\. Quyết định (Decision)

Xây dựng ứng dụng Frontend (`apps/web`) sử dụng **Next.js** kết hợp tính năng **Progressive Web App (PWA)** và tư duy thiết kế **Mobile-first**:

* Tối ưu UI/UX ưu tiên cho màn hình điện thoại di động trước, sau đó mới mở rộng cho máy tính (Responsive Design).
* Cấu hình PWA (Service Workers, Web App Manifest) cho phép người dùng "Thêm vào màn hình chính" (Add to Home Screen) trên smartphone và phản hồi nhanh khi mất mạng tạm thời.

## 3\. Các phương án đã cân nhắc (Considered Options)

1. **Single Page Application (React SPA thông thường)**: Render toàn bộ ở Client, SEO kém hơn và khó tối ưu trải nghiệm PWA mượt mà.
2. **Next.js PWA (Mobile-first)**: Hỗ trợ Server-Side Rendering (SSR) / Static Site Generation (SSG), tải trang cực nhanh và có trải nghiệm như app native.

## 4\. Hệ quả &amp; Đánh đổi (Consequences)

* **Ưu điểm**:
  * Trải nghiệm đặt hàng trên điện thoại di động mượt mà mà người dùng không cần tải ứng dụng từ App Store hay Google Play.
  * Tối ưu hiệu năng tải trang ban đầu nhờ cơ chế rendering hiện đại của Next.js.
* **Hạn chế (Trade-off)**:
  * Cần thêm công đoạn cấu hình Service Worker và kiểm thử giao diện trên nhiều kích thước màn hình thiết bị di động khác nhau.