# UC-CHECKOUT — Đặt và thanh toán đơn hàng

## 1. Thông tin
| Thuộc tính | Nội dung |
|---|---|
| Tác nhân chính | CUSTOMER |
| Tác nhân hỗ trợ | STAFF/MANAGER xác nhận CASH ở quầy; PaymentService là module nội bộ NestJS, không phải cổng ngoài |
| Trigger | Khách chọn Thanh toán ở giỏ |
| Liên kết | FR-03, FR-04, FR-05, FR-07; NFR-02; hủy theo FR-08 |
| Sơ đồ | [Use-case](../diagrams/usecase-checkout.svg), [Activity](../diagrams/activity.svg), [Sequence](../diagrams/sequence.svg), nguồn .puml cùng tên |

## 2. Tiền điều kiện
Có ít nhất một món trong giỏ và người dùng là CUSTOMER. JWT còn hạn trước khi gọi API; khách chưa đăng nhập đi theo luồng A1. Món/tùy chọn/kho vẫn phải được server xác minh, không được giả định giỏ trình duyệt luôn còn hợp lệ.

## 3. Hậu điều kiện
| Kết quả | Đơn/kho/tiền/giỏ |
|---|---|
| Ví/Thẻ thành công | PAID, Payment SUCCESS, kho đã giữ/trừ, thu một lần, giỏ UI rỗng |
| Chọn CASH thành công | PENDING_PAYMENT, Payment CASH/PENDING, kho giữ, giỏ UI rỗng, chờ nhân viên thu tiền; không giả định đã PAID |
| Lỗi tạo đơn | Transaction rollback, không có đơn mới hoặc trừ kho một phần |
| Payment validate 400 | Chưa thu tiền; có thể giữ PENDING_PAYMENT và kho đã giữ từ lúc tạo đơn; giỏ UI còn |
| Nghiệp vụ 402 | CANCELLED, Payment FAILED, hoàn kho, không thu ví; giỏ còn, lần thử sau tạo đơn mới |
| Mạng/5xx chưa biết kết quả | Chưa kết luận đã thu/hủy; giữ đơn và key, đọc lại/gửi lại để lấy kết quả |
| Đơn quá hạn | Khi request kích hoạt kiểm tra TTL: CANCELLED, hoàn kho, vô hiệu giao dịch chờ, không thể thanh toán/thu CASH tiếp |

## 4. Luồng chính Ví/Thẻ
1. Khách vào checkout. UI đối chiếu giỏ với menu, bỏ món ngừng bán/cập nhật giá, hiện tổng tiền.
2. Khách chọn Ví hoặc Thẻ và xác nhận đặt hàng.
3. UI POST /orders kèm JWT và items; API kiểm JWT, role CUSTOMER, DTO.
4. OrderService kiểm tra món/size/topping và tính giá server; trong transaction, trừ kho có điều kiện theo thứ tự productId, tạo Order PENDING_PAYMENT và snapshot OrderItem; lỗi rollback toàn bộ.
5. API trả 201; UI giữ orderId và key, hiện form cổng mô phỏng.
6. Khách xác nhận thanh toán; UI POST /payments kèm JWT, Idempotency-Key, orderId/method/card nếu cần.
7. PaymentService kiểm khóa; nếu đã xử lý thì trả kết quả cũ. Yêu cầu mới kiểm thẻ, TTL, sở hữu/trạng thái đơn và giao dịch CASH đang chờ.
8. Trong transaction, chuyển có điều kiện PENDING_PAYMENT → PAID để chỉ một request xử lý; trừ ví có điều kiện hoặc mô phỏng thẻ, ghi Payment SUCCESS rồi commit.
9. Trả 201; UI làm rỗng giỏ, hiện xác nhận/mã đơn; khách theo dõi PAID → PREPARING → READY → COMPLETED.

## 5. Luồng thay thế
- A1 — Chưa đăng nhập: hiện yêu cầu đăng nhập; đăng nhập/đăng ký, trở lại checkout và giữ giỏ, tiếp tục bước 1.
- A2 — CASH: sau bước 4, POST /payments method CASH tạo giao dịch PENDING và giữ đơn PENDING_PAYMENT. UI làm rỗng giỏ và nhắc ra quầy. Thu tiền là use-case UC-COUNTER riêng: STAFF/MANAGER POST /orders/:id/confirm-cash chuyển PAID/SUCCESS. Không bắt buộc thu CASH xong mới kết thúc checkout của khách.
- A3 — Đổi phương thức trước kết quả thanh toán: UI dùng lại đơn đang giữ; không tạo đơn mới chỉ vì đổi màn hình. Khi đã có CASH/PENDING, API từ chối thanh toán thêm bằng phương thức khác (409).
- A4 — Quá hạn: TTL mặc định 15 phút qua ORDER_PAYMENT_TTL_MINUTES. Kiểm tra được gọi khi tạo đơn/thanh toán/xem đơn liên quan; không có cron/timer hủy đúng phút thứ 15. Giao dịch thẻ mô phỏng timeout là lỗi nghiệp vụ đã biết (402), khác timeout mạng chưa biết kết quả.

## 6. Ngoại lệ
| Mã | Tại bước | Xử lý |
|---|---|---|
| E1 | 3 hoặc 6: JWT sai/hết hạn | 401, UI đăng xuất/yêu cầu đăng nhập, giữ giỏ |
| E2 | 3 hoặc 6: không phải CUSTOMER | 403, không tạo/thu đơn từ tài khoản quầy/quản lý |
| E3 | 3–4: DTO/món/size/topping sai | 400, rollback, báo lỗi; không giả định có đơn để hủy |
| E4 | 4: hết kho | 400 OUT_OF_STOCK, rollback toàn bộ, UI dẫn về giỏ |
| E5 | 6–7: dữ liệu thẻ/header sai | UI validate hoặc API 400 trước khi thu; đơn có thể tiếp tục giữ kho |
| E6 | 8: ví thiếu, thẻ từ chối/timeout mô phỏng | Transaction ghi CANCELLED/FAILED và hoàn kho, commit rồi trả 402; UI giữ giỏ, thử lại bằng đơn mới |
| E7 | 7: key đã dùng | Cùng user/key/order trả payment cũ (201 hoặc 402); key cho order khác trả 409; không trừ/hoàn kho lần hai |
| E8 | 7–8: đơn không còn payable/đã xử lý song song | 409; race cùng key được đọc lại để replay, không tự thu lần hai |
| E9 | 6–9: mất mạng/5xx | Không suy ra thất bại nghiệp vụ; giữ đơn/key, đọc lại/gửi lại để xác định kết quả |

## 7. Quy tắc nghiệp vụ
Giá và tiền VND là integer; giá server quyết định. Mỗi CUSTOMER mới có ví mô phỏng 200.000đ. Thẻ đầu 4000/cuối 0002 bị từ chối, cuối 0003 mô phỏng timeout; chỉ lưu cardLast4, không lưu số/CVV. Unique (userId,idempotencyKey) bảo vệ gửi trùng. Hủy trước pha chế theo UC-CANCEL/FR-08 hoàn kho và hoàn ví đã thu; không thanh toán lại đơn CANCELLED.

## 8. Acceptance criteria và test
Mã INT/E2E theo [tests/README](../../tests/README.md); [matrix](../traceability-matrix.md) dẫn tới file thật.
| AC | Mong đợi | Kiểm chứng |
|---|---|---|
| AC-01 | Ví thành công PAID, trừ đúng một lần | INT-T03, E2E-T01 |
| AC-02 | Thẻ từ chối 402, CANCELLED/hoàn kho, giỏ còn; thử lại bằng đơn mới thành công | INT-T03, E2E-T02 |
| AC-03 | Hết kho không tạo đơn, không âm/trừ một phần | INT-T02, E2E-T03 |
| AC-04 | Cùng user/key replay, request song song không thu lần hai | INT-T03 |
| AC-05 | Chưa đăng nhập được yêu cầu đăng nhập và giữ giỏ | E2E-T01 |
| AC-06 | CASH/PENDING; nhân viên xác nhận PAID; request kiểm TTL sau quá hạn hủy/hoàn kho | INT-T04 kiểm TTL, E2E-T04 kiểm quầy; E2E không thay test TTL |
| AC-07 | Payment 400 giữ đơn chờ/kho đã giữ khi phù hợp | INT-T03 |
| AC-08 | Mạng/5xx giữ đơn/key để xác định kết quả | [CheckoutScreen test](../../apps/web/src/features/checkout/__tests__/CheckoutScreen.test.tsx) |
| AC-09 | Hủy PENDING_PAYMENT/PAID trước pha chế; hoàn ví/kho một lần, từ chối PREPARING | INT-T04, E2E-T04 |
