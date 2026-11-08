# Đặc tả use-case: Đặt và thanh toán đơn hàng (UC-CHECKOUT)

Sơ đồ: [use-case](../diagrams/usecase-checkout.svg), [activity](../diagrams/activity-checkout.svg), [sequence](../diagrams/sequence-checkout.svg).

## 1. Thông tin chung

| Mục | Nội dung |
|---|---|
| Mã | UC-CHECKOUT |
| Tên | Đặt và thanh toán đơn hàng |
| Tác nhân chính | Khách hàng (vai trò `CUSTOMER`) |
| Tác nhân phụ | Dịch vụ thanh toán mô phỏng; Nhân viên quầy (chỉ với tiền mặt) |
| Yêu cầu liên quan | FR-03 Giỏ hàng, FR-04 Đăng nhập, FR-05 Đặt đơn và thanh toán, FR-07 Quản lý trạng thái đơn, NFR-02 Bảo mật |
| Trigger | Khách nhấn **"Thanh toán"** ở trang giỏ hàng |

## 2. Mô tả ngắn

Khách đặt các món trong giỏ và thanh toán bằng ví hoặc thẻ mô phỏng. Hệ thống tính lại giá ở server, giữ tồn kho trong lúc chờ thanh toán và không bao giờ trừ tiền hai lần cho cùng một yêu cầu. Không có giao hàng: khách nhận đồ tại quầy.

## 3. Tiền điều kiện

1. Giỏ hàng có ít nhất một món.
2. Khách đã đăng nhập bằng tài khoản `CUSTOMER` với JWT còn hạn. Nếu chưa, hệ thống chuyển sang luồng 6.1 trước.

## 4. Hậu điều kiện

| Kết quả | Trạng thái |
|---|---|
| Thành công (Ví, Thẻ) | Đơn `PAID`, giao dịch `SUCCESS`, tồn kho đã trừ, giỏ hàng trống |
| Thành công (Tiền mặt) | Đơn `PENDING_PAYMENT` chờ thu tiền tại quầy, giao dịch `PENDING`, giỏ hàng trống |
| Thất bại | Không bị trừ tiền; đơn vừa tạo `CANCELLED`, tồn kho được trả lại, giỏ hàng còn nguyên |

## 5. Luồng chính (Ví hoặc Thẻ)

1. Khách nhấn **"Thanh toán"** trong giỏ hàng.
2. Hệ thống đối chiếu giỏ với menu: bỏ món không còn bán, cập nhật giá mới, rồi hiện tóm tắt đơn và tổng tiền.
3. Khách chọn **Ví BrewLite** hoặc **Thẻ ngân hàng**, nhấn **"Xác nhận đặt hàng"**.
4. API kiểm tra JWT, vai trò và dữ liệu; trong một transaction: tính lại giá ở server, trừ tồn kho có điều kiện, tạo đơn `PENDING_PAYMENT` (giữ hàng tối đa 15 phút).
5. Hệ thống hiện cổng thanh toán mô phỏng: số dư ví, hoặc form thẻ.
6. Khách nhấn **"Xác nhận thanh toán"**; UI gửi kèm `Idempotency-Key`.
7. Dịch vụ thanh toán mô phỏng trừ số dư ví hoặc xử lý thẻ.
8. Hệ thống ghi giao dịch `SUCCESS`, chuyển đơn sang `PAID`, làm rỗng giỏ và hiện **"Đặt hàng thành công"** kèm mã đơn.
9. Khách theo dõi đơn: đã thanh toán → đang pha chế → sẵn sàng → hoàn tất.

## 6. Luồng thay thế

### 6.1. Chưa đăng nhập (tại bước 1)
1. Hệ thống hiện "Bạn cần đăng nhập" kèm nút **Đăng nhập**.
2. Khách nhấn nút, đăng nhập hoặc đăng ký; hệ thống cấp JWT.
3. Hệ thống quay lại trang thanh toán, giỏ hàng còn nguyên; tiếp tục bước 2.

### 6.2. Trả tiền mặt tại quầy (tại bước 3, phần mở rộng)
1. Khách chọn **Tiền mặt tại quầy**.
2. Sau bước 4, hệ thống ghi giao dịch `CASH` ở trạng thái `PENDING`, làm rỗng giỏ và nhắc khách ra quầy trong 15 phút.
3. Nhân viên thu tiền, nhấn **"Đã thu tiền mặt"**; đơn chuyển sang `PAID`.
4. Quá 15 phút chưa thu: đơn tự hủy và trả lại tồn kho.

### 6.3. Đổi phương thức (tại bước 5)
1. Khách nhấn **"Chọn phương thức khác"**; hệ thống dùng lại đơn đang giữ, không tạo đơn mới.

## 7. Luồng ngoại lệ

| Mã | Tại bước | Tình huống | Hệ thống xử lý |
|---|---|---|---|
| 7.1 | 4 | Không đủ tồn kho | Rollback, trả `400 OUT_OF_STOCK`; báo *"Sản phẩm [tên] không đủ số lượng tồn kho."* và dẫn về giỏ hàng |
| 7.2 | 7 | Ví không đủ tiền, thẻ bị từ chối hoặc hết thời gian chờ | Hủy đơn, trả lại tồn kho, lưu giao dịch `FAILED`, trả `402`; báo *"Thanh toán thất bại, vui lòng thử lại."*; giỏ còn nguyên, lần thử sau tạo đơn mới |
| 7.3 | 5 | Thẻ sai định dạng hoặc hết hạn | Báo lỗi ngay tại form, không gửi yêu cầu thanh toán |
| 7.4 | 6 | Gửi lại cùng `Idempotency-Key` (bấm đúp, mất mạng rồi thử lại) | Trả lại kết quả lần trước, không trừ tiền lần hai |
| 7.5 | 6 | Đơn đã quá 15 phút giữ hàng | Báo đơn không còn hiệu lực; lần thử sau tạo đơn mới |
| 7.6 | 4, 6 | JWT hết hạn hoặc không hợp lệ | Trả `401`; đăng xuất, yêu cầu đăng nhập lại; giỏ hàng còn nguyên |
| 7.7 | 3 | Tài khoản nhân viên hoặc quản lý | Không cho đặt đơn; API trả `403` |

## 8. Quy tắc nghiệp vụ

- Giá do server tính lại từ dữ liệu sản phẩm, không tin giá client gửi lên.
- Tồn kho chỉ bị trừ khi còn đủ (`stock >= số lượng`), nên không bao giờ âm kể cả khi nhiều người đặt cùng lúc.
- Mỗi tài khoản mới có sẵn 200.000 ₫ trong ví mô phỏng; thẻ chỉ lưu 4 số cuối.
- Thẻ bắt đầu bằng `4000` hoặc kết thúc bằng `0002` bị từ chối, kết thúc bằng `0003` mô phỏng hết thời gian chờ.

## 9. Tiêu chí chấp nhận

| Mã | Tiêu chí | Test |
|---|---|---|
| AC-01 | Đặt và trả bằng ví thành công: đơn `PAID`, số dư giảm đúng tổng tiền | INT-T03, E2E-T01 |
| AC-02 | Thẻ bị từ chối: không trừ tiền, giỏ còn nguyên, thử lại thành công | INT-T03, E2E-T02 |
| AC-03 | Hết hàng: không tạo đơn, tồn kho không âm | INT-T02, E2E-T03 |
| AC-04 | Gửi lại cùng `Idempotency-Key`: chỉ một giao dịch, trừ tiền một lần | INT-T03 |
| AC-05 | Chưa đăng nhập: được yêu cầu đăng nhập, giỏ hàng còn nguyên | E2E-T01 |
| AC-06 | Tiền mặt: nhân viên xác nhận thì đơn `PAID`; quá 15 phút thì tự hủy | INT-T04, E2E-T04 |
