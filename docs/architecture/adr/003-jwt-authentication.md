# ADR 003: Sử dụng JSON Web Token (JWT) cho Cơ chế Xác thực Stateless

* **Ngày**: 2026-10-18
* **Trạng thái**: Accepted
* **Người quyết định**: Architect / DevOps (TV3)

## 1\. Bối cảnh (Context)

Ứng dụng BrewLite yêu cầu cơ chế xác thực người dùng giữa ứng dụng Frontend Next.js (Mobile-first/PWA) và Backend NestJS RESTful API. Hệ thống cần đảm bảo an toàn, hiệu năng cao, mở rộng tốt và hỗ trợ trải nghiệm đăng nhập mượt mà trên thiết bị di động mà không cần lưu giữ session trạng thái trên server Backend.

## 2\. Quyết định (Decision)

Sử dụng **JSON Web Token (JWT)** làm phương thức xác thực chuẩn (Stateless Authentication):

* Khi đăng nhập thành công, Backend NestJS sẽ cấp phát một cặp **Access Token** (thời hạn ngắn, mặc định 1 ngày) và **Refresh Token** (thời hạn 7 ngày).
* Frontend Next.js lưu token và tự động gửi kèm Access Token qua HTTP Header `Authorization: Bearer <token>` trong các yêu cầu gọi tới Backend API (`apiClient.ts`).
* Backend NestJS sử dụng Passport JWT Strategy (`JwtAuthGuard`) và `RolesGuard` để xác thực danh tính, phân quyền người dùng (`CUSTOMER`, `STAFF`, `MANAGER`).
* Khi Access Token hết hạn (API trả về HTTP 401), hệ thống hỗ trợ cơ chế cấp mới token qua Refresh Token mà không bắt người dùng phải đăng nhập lại thủ công.

## 3\. Các phương án đã cân nhắc (Considered Options)

1. **Session-based Authentication (Cookie & Redis Session)**: Lưu session ID trong Cookie và tra cứu thông tin phiên làm việc trong Redis/Database.
2. **Stateless JWT Authentication**: Đóng gói thông tin người dùng (userId, role) trực tiếp trong chuỗi JWT có chữ ký số mã hóa.

## 4\. Hệ quả & Đánh đổi (Consequences)

* **Ưu điểm**:
  * **Stateless & Scalable**: Backend không cần truy vấn Database/Redis để kiểm tra session cho mỗi request, giúp tối ưu hiệu năng và dễ dàng mở rộng máy chủ API.
  * **Phù hợp PWA / Mobile**: Dễ dàng tích hợp với ứng dụng di động Next.js qua các tiêu chuẩn RESTful API.
* **Hạn chế (Trade-off)**:
  * Khó thu hồi (revoke) token ngay lập tức trước khi hết hạn trừ khi kết hợp cơ chế Blacklist ngắn hạn.
  * Cần cẩn trọng trong việc lưu trữ token phía Client để chống lỗ hổng XSS/CSRF.