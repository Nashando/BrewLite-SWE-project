# ADR 004: Sử dụng Dịch vụ Thanh toán Mô phỏng (Mock Payment) và Cơ chế Idempotency Key

* **Ngày**: 2026-10-18
* **Trạng thái**: Accepted
* **Người quyết định**: Architect / DevOps (TV3)

## 1\. Bối cảnh (Context)

Trong luồng đặt cà phê của BrewLite, bước thanh toán trực tuyến (Ví điện tử / Thẻ) là bắt buộc. Nhóm cần một phương án xử lý thanh toán đảm bảo an toàn giao dịch, có thể kiểm thử mượt mà trong phạm vi đồ án mà không bị phụ thuộc vào thủ tục đăng ký pháp lý của các cổng thanh toán thật (Momo, VNPay, ZaloPay), đồng thời phải chống được hiện tượng người dùng nhấn nút thanh toán nhiều lần gây trùng lặp đơn hàng.

## 2\. Quyết định (Decision)

1. **Xây dựng Dịch vụ Thanh toán Mô phỏng (Mock Payment Service)**: Giả lập các phản hồi thanh toán thành công/thất bại thông qua API tích hợp nội bộ hoặc Webhook.
2. **Áp dụng cơ chế Idempotency Key**:
  * Client Frontend gửi kèm một chuỗi định danh duy nhất (`Idempotency-Key` dạng UUID) trong HTTP Header khi gửi yêu cầu thanh toán.
  * Backend NestJS kiểm tra khóa này trong CSDL/Cache; nếu yêu cầu đã được xử lý trước đó, hệ thống sẽ trả về ngay kết quả đã lưu mà không thực hiện trừ tiền hay tạo đơn lặp lại.

## 3\. Các phương án đã cân nhắc (Considered Options)

1. **Tích hợp Cổng thanh toán Sandbox thật (VNPay/Momo Sandbox)**: Đòi hỏi tài khoản doanh nghiệp/đối tác và phụ thuộc vào kết nối mạng bên ngoài.
2. **Mock Payment Service nội bộ tích hợp Idempotency Key**: Chủ động hoàn toàn về mã nguồn, đáp ứng đầy đủ yêu cầu kiểm thử và chuẩn kỹ thuật của bài tập lớn.

## 4\. Hệ quả &amp; Đánh đổi (Consequences)

* **Ưu điểm**:
  * Giúp nhóm chủ động kiểm thử mọi kịch bản (Thanh toán thành công, Thất bại, Timeout, Nhấn đúp nút) mà không phát sinh chi phí.
  * Đảm bảo tính toàn vẹn dữ liệu và chống trừ tiền lặp nhờ Idempotency Key.
* **Hạn chế (Trade-off)**:
  * Không xử lý dòng tiền thật, cần ghi rõ trong tài liệu kiến trúc đây là Mock Service phục vụ nghiệm thu đồ án.