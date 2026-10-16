# 1. Bối cảnh và Phạm vi - BrewLite

## 1.1 Vấn đề nghiệp vụ
Khách hàng phải xếp hàng lâu để gọi đồ uống. Nhân viên quầy ghi đơn thủ công dễ sai sót. Quản lý khó theo dõi doanh thu và tồn kho theo thời gian thực.
→ BrewLite giải quyết vấn đề này bằng cách cho phép khách đặt đồ uống trực tuyến qua điện thoại.

## 1.2 Stakeholder và Kỳ vọng
| Stakeholder | Mục tiêu / Kỳ vọng |
|---|---|
| Khách hàng | Đặt đồ uống nhanh, theo dõi đơn hàng, thanh toán tiện lợi. |
| Nhân viên quầy | Nhận đơn rõ ràng, giảm sai sót khi ghi đơn. |
| Quản lý cửa hàng | Theo dõi doanh thu, tồn kho và trạng thái đơn hàng dễ dàng. |
| Giảng viên / Khách nghiệm thu | Ứng dụng chạy được, đúng yêu cầu đề bài. |
| Nhóm phát triển | Hoàn thành đúng deadline, code chạy ổn định. |
| Đơn vị thanh toán | Giao dịch thành công, bảo mật thông tin. |

## 1.3 Phạm vi
### Trong phạm vi (In-scope) - MVP
- Xem menu, chi tiết sản phẩm.
- Chọn size, topping.
- Giỏ hàng, tính tổng tiền.
- Đăng ký, đăng nhập.
- Đặt hàng, thanh toán mô phỏng (Ví/Thẻ).
- Theo dõi trạng thái và lịch sử đơn hàng.

### Ngoài phạm vi (Out-of-scope)
- Giao hàng tận nơi.
- Quản lý nhân sự.
- Tích hợp thanh toán thật (Momo, ZaloPay).
- Báo cáo tài chính nâng cao.

## 1.4 Giả định
- Người dùng có điện thoại hoặc trình duyệt web.
- Cửa hàng đã có sẵn dữ liệu menu.
- Thanh toán chỉ mô phỏng, không dùng tiền thật.

## 1.5 Ràng buộc
- Frontend: Next.js (mobile-first/PWA).
- Backend: NestJS.
- Database: PostgreSQL.
- Phải chạy được trên Docker.

## 1.6 Rủi ro ban đầu
- Tiến độ Task 1-2 chậm ảnh hưởng toàn bộ dự án.
- Sơ đồ thiết kế không khớp với code thực tế.
- Deploy production thất bại sát hạn chót.
