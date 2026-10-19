# Tài liệu Thiết kế Kiến trúc Hệ thống BrewLite (Architecture Document)

## 1. Tổng quan & Phương pháp Kiến trúc
- **Dự án**: BrewLite – Hệ thống đặt cà phê & đồ uống trực tuyến theo mô hình chuỗi cửa hàng Starbucks.
- **Mục tiêu**: Cung cấp kiến trúc hệ thống hiện đại, linh hoạt, đảm bảo tính mở rộng, bảo mật, khả năng bảo trì và hỗ trợ luồng nghiệp vụ end-to-end từ xem menu đến đặt đơn và thanh toán.
- **Phương pháp thiết kế**: Áp dụng **Mô hình C4 (C4 Model)** (Level 1 & Level 2) kết hợp với **Kiến trúc Phân lớp theo Domain/Module (Modular Layered Architecture)** cho Backend.
- **Bộ công nghệ cốt lõi**:
  - **Frontend**: Next.js (phát triển theo hướng Mobile-first / PWA).
  - **Backend**: NestJS (Node.js framework chia theo module/domain).
  - **Database**: PostgreSQL quản lý qua cơ chế Migration.

---

## 2. Mô hình Kiến trúc C4 (C4 Model)

### 2.1 Level 1: System Context Diagram (Bối cảnh hệ thống)
Sơ đồ bối cảnh mô tả tương tác giữa các tác nhân người dùng và hệ thống bên ngoài với BrewLite:

- **Tác nhân (Actors)**:
  - **Khách hàng (Customer)**: Xem menu, chọn đồ uống với các tùy chọn linh hoạt (Size, độ ngọt, lượng đá, loại sữa, toppings/extra shots), quản lý giỏ hàng, đặt đơn hàng "Order Ahead & Pickup", thanh toán và theo dõi lịch sử tích điểm đổi quà .
  - **Nhân viên / Quản lý quầy (Store Staff / Manager)**: Xem danh sách đơn hàng theo thời gian thực, tiếp nhận và cập nhật trạng thái đơn (Mới tạo -> Đang pha chế -> Sẵn sàng lấy đồ -> Hoàn thành).
- **Hệ thống BrewLite (BrewLite System)**: Tiếp nhận yêu cầu từ người dùng, xử lý logic đặt đồ uống, quản lý tồn kho và lưu trữ lịch sử giao dịch.
- **Hệ thống bên ngoài (External Systems)**:
  - **Dịch vụ Thanh toán Mô phỏng (Mock Payment Gateway)**: Xử lý các giao dịch Ví điện tử / Thẻ mô phỏng, phản hồi trạng thái giao dịch và đảm bảo tính an toàn giao dịch.

### 2.2 Level 2: Container Diagram (Các thành phần Container)
Hệ thống được chia thành 3 container chính hoạt động độc lập:

1. **Frontend Application Container (`apps/web`)**:
   - **Công nghệ**: Next.js (React Framework, PWA support).
   - **Nhiệm vụ**: Render giao diện người dùng di động, quản lý client state (Giỏ hàng, JWT Auth Token), thực hiện validate dữ liệu phía client và giao tiếp với Backend API qua giao thức HTTPS.
2. **Backend Application Container (`apps/api`)**:
   - **Công nghệ**: NestJS (TypeScript Framework).
   - **Nhiệm vụ**: Cung cấp RESTful API, thực thi nghiệp vụ đặt hàng (Database Transactions), xác thực người dùng bằng JWT Guard, tích hợp cơ chế Idempotency cho thanh toán và cung cấp endpoint Health Check [1, 5].
3. **Database Container (`PostgreSQL Container`)**:
   - **Công nghệ**: PostgreSQL (chạy trên persistent storage).
   - **Nhiệm vụ**: Lưu trữ toàn bộ dữ liệu quan hệ (User, Product, ProductOption, Order, OrderItem, Payment, Promotion, LoyaltyTransaction) và thực thi script migration tự động.

---

## 3. Kiến trúc Chi tiết Backend NestJS (`apps/api`)
Backend NestJS được thiết kế theo dạng **Module-based** tương ứng với từng miền nghiệp vụ (Domain-Driven Modules):

- **Auth Module**: Đăng ký, đăng nhập, mã hóa mật khẩu (bcrypt), phát hành và kiểm tra **JWT Access Token**.
- **Products Module**: Cung cấp danh mục đồ uống (Cà phê, Trà, Freeze), danh mục Size (Tall, Grande, Venti), mức độ ngọt/đá, lựa chọn loại sữa (sữa tươi, sữa hạt) và danh sách Topping/Extra Shots bổ sung theo mô hình Starbucks.
- **Cart Module**: Quản lý giỏ hàng tạm thời, tính toán tổng tiền dựa trên các tùy chọn món và áp dụng voucher/mã giảm giá.
- **Order Module**: Tiếp nhận đơn hàng, thực thi **Database Transaction** để đảm bảo tính toàn vẹn khi kiểm tra/trừ số lượng tồn kho và cập nhật trạng thái đơn.
- **Payment Module**: Xử lý giao dịch qua Cổng thanh toán mô phỏng (Ví/Thẻ), áp dụng cơ chế **Idempotency Key** để chống thanh toán trùng lặp khi người dùng gửi lại request.
- **Loyalty & Promotion Module**: Quản lý tích điểm thưởng (Starbucks Rewards) sau khi hoàn thành đơn hàng và quản lý danh mục mã ưu đãi.
- **Health & Monitoring Module**: Cung cấp đường dẫn `GET /health` kiểm tra tình trạng sống của API và kết nối Database.

---

## 4. Quản lý Cơ sở Dữ liệu & Cơ chế Migration
- **ORM / Query Builder**: Sử dụng **Prisma ORM** (hoặc TypeORM) để định nghĩa Schema type-safe và tương tác với cơ sở dữ liệu PostgreSQL.
- **Cơ chế Migration (Database Migration)**:
  - Mọi thay đổi về cấu trúc bảng/cột phải được ghi lại dưới dạng các tệp migration có đánh số phiên bản trong thư mục `apps/api/prisma/migrations`.
  - Pipeline CD sẽ tự động kích hoạt lệnh migration (`npx prisma migrate deploy`) trong quá trình triển khai Production để đảm bảo dữ liệu luôn đồng bộ và không bị thất thoát.
- **Dữ liệu khởi tạo (Data Seeding)**: Cung cấp tệp `seed.ts` để nạp sẵn dữ liệu mẫu về thực đơn đồ uống Starbucks (giá, biến thể size, toppings) phục vụ quá trình phát triển local và kiểm thử.

---

## 5. Quản lý Cấu hình, Health Check & Logging
- **Quản lý Cấu hình (Environment Variables)**:
  - Tất cả cấu hình hệ thống và thông tin nhạy cảm (`DATABASE_URL`, `JWT_SECRET`, `PORT`) được lưu trong tệp `.env` local (mẫu cung cấp tại `.env.example`) và truyền qua biến môi trường của nền tảng Cloud khi triển khai Production.
- **Health Check Endpoint**:
  - Tích hợp NestJS Terminus tại endpoint `GET /health` phản hồi trạng thái hoạt động của dịch vụ API và khả năng kết nối tới PostgreSQL Database.
- **Logging & Monitoring**:
  - Sử dụng cấu trúc Logger chuẩn của NestJS để ghi vết toàn bộ API request, thời gian xử lý và các lỗi ngoại lệ (Exceptions) phục vụ công tác truy vết.

---

## 6. Đánh giá Đánh đổi Kiến trúc (Trade-offs & Decisions)
- **Cấu trúc Monorepo**:
  - *Lý do lựa chọn*: Quản lý cả `apps/web`, `apps/api` và `docs` trong cùng một repository giúp đồng bộ quy trình phát triển, quy ước commit và dễ chia sẻ cấu hình CI/CD.
  - *Đánh đổi (Trade-off)*: Dung lượng repo lớn hơn, đòi hỏi cấu hình CI pipeline nhận biết thay đổi theo từng ứng dụng để tối ưu thời gian build.
- **Dịch vụ Thanh toán Mô phỏng (Mock Payment Service)**:
  - *Lý do lựa chọn*: Giúp nhóm chủ động phát triển và kiểm thử toàn bộ luồng thanh toán mà không bị phụ thuộc vào thủ tục đăng ký cổng thanh toán thật.
  - *Đánh đổi (Trade-off)*: Không xử lý tiền thật, nhưng vẫn đảm bảo áp dụng đầy đủ các chuẩn kỹ thuật như Idempotency, mã giao dịch ngẫu nhiên và phản hồi Webhook.
- **Ứng dụng Web PWA (Mobile-first)**:
  - *Lý do lựa chọn*: Giúp khách hàng có trải nghiệm đặt cà phê mượt mà trên thiết bị di động như app native mà không cần cài đặt từ App Store.