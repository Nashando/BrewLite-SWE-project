# SRS rút gọn — BrewLite

Bản đối chiếu ngày 15/11/2026, source nền 9808d37. Tài liệu này mô tả yêu cầu và tiêu chí kiểm chứng; kết quả test/đo có thể chưa đạt một tiêu chí, không tự sửa tiêu chí thành PASS.

## 1. Phạm vi và quy ước
MVP: menu → tùy chọn → giỏ → đăng nhập → tạo đơn → Ví/Thẻ mô phỏng → theo dõi đơn tại quầy. CASH, quản trị catalog và doanh thu đã có ở source; giữ ưu tiên theo bảng dưới. CUSTOMER/STAFF/MANAGER là role thực; không có enum ADMIN. Promotion/Loyalty chỉ là mô hình mở rộng theo yêu cầu class diagram, chưa hiện thực.

[Context/scope](context-and-scope.md), [use-case trọng tâm](use-case-checkout.md), [ma trận truy vết](../traceability-matrix.md).

## 2. Yêu cầu chức năng và tiêu chí chấp nhận
| Mã | Yêu cầu | MoSCoW | Tiêu chí chấp nhận có thể kiểm chứng |
|---|---|---|---|
| FR-01 | Xem menu | Must | GET /products trả món đang bán; UI hiển thị tên/giá/danh mục; có loading, empty và error với nút thử lại. Tìm/lọc mô tả riêng tại FR-09. |
| FR-02 | Chi tiết và tùy chọn | Must | GET /products/:id trả mô tả, size và topping; chọn tùy chọn/số lượng cập nhật giá. Món không tồn tại/ẩn: API 404, UI trạng thái không tìm thấy. Hết hàng không cho thêm mới. |
| FR-03 | Giỏ hàng | Must | Thêm/sửa/xóa, số lượng/tùy chọn/tổng tiền đúng; giỏ trình duyệt còn sau reload/đăng nhập. Khi đối chiếu menu, bỏ món ngừng bán và cập nhật giá. Không nhận giá client làm giá thanh toán. |
| FR-04 | Đăng ký/đăng nhập | Must | Đăng ký hợp lệ tạo CUSTOMER; ví mô phỏng 200.000đ. Đăng nhập cấp JWT. Trùng email/dữ liệu sai bị từ chối; sai thông tin/token không hợp lệ trả 401. API có refresh; UI hiện đăng xuất khi 401, không tự refresh. |
| FR-05 | Tạo đơn và thanh toán | Must | POST /orders tính giá server, giữ/trừ kho trong transaction, tạo PENDING_PAYMENT, không âm kho. Ví/Thẻ thành công: PAID/SUCCESS, giỏ UI rỗng. Gửi lại cùng user/key trả kết quả cũ; 402: CANCELLED/FAILED, hoàn kho, giữ giỏ và tạo đơn mới để thử lại. Payment validate 400 có thể giữ đơn/kho đã giữ. Mạng/5xx phải xác minh cùng đơn/key. CASH: PENDING_PAYMENT/PENDING đến khi quầy thu tiền. AC-01–09 trong UC-CHECKOUT. |
| FR-06 | Lịch sử/theo dõi đơn | Should | GET /orders chỉ trả đơn của người dùng; xem chi tiết/trạng thái, người khác không đọc được đơn. Quầy dùng GET /orders/all, không dùng GET /orders thay cho danh sách toàn bộ. |
| FR-07 | Xử lý tại quầy | Should | STAFF/MANAGER xem tất cả đơn; PATCH /orders/:id/status chỉ PAID → PREPARING → READY → COMPLETED, sai thứ tự trả 409. POST /orders/:id/confirm-cash chỉ xác nhận CASH còn chờ; không dùng PATCH để bỏ qua thanh toán. CUSTOMER bị 403 ở nghiệp vụ quầy. |
| FR-08 | Hủy trước pha chế | Should | Khách hủy đơn mình/nhân viên xử lý theo quyền khi PENDING_PAYMENT hoặc PAID; hoàn kho, hoàn ví nếu đã thu, cập nhật giao dịch liên quan. Hủy lặp không hoàn hai lần; PREPARING trở đi bị từ chối. |
| FR-09 | Tìm/lọc menu | Should | UI tìm tên không phân biệt hoa/thường/dấu, lọc danh mục; rỗng có thông báo. API cũng hỗ trợ search/category nhưng UI hiện lọc client sau GET /products; không coi test matchesSearch là test API search. |
| FR-10 | Quản lý catalog/kho | Could | MANAGER thêm/sửa/ẩn món/topping, thay danh sách size và điều chỉnh kho không âm. Ẩn qua isActive=false, không DELETE sản phẩm; snapshot đơn cũ giữ nguyên. Source không cấm ẩn món chỉ vì có đơn chờ. Người không phải MANAGER bị 403. |
| FR-11 | Doanh thu | Could | MANAGER xem doanh thu/số đơn/món bán chạy; không tính đơn chờ hoặc đã hủy, lọc khoảng thời gian hỗ trợ. Người không có quyền bị từ chối. |

## 3. Yêu cầu phi chức năng
| Mã | Yêu cầu | MoSCoW | Tiêu chí và phương pháp |
|---|---|---|---|
| NFR-01 | Hiệu năng menu | Should | Mục tiêu LCP <2.000ms: Chromium, production build, 375×812, 3 navigation ở browser context mới, không throttle; ghi từng mẫu/trung vị, máy/mạng/CPU và source. Local chỉ xác nhận local, không suy ra cloud production. |
| NFR-02 | Bảo mật/xác thực | Must | Mật khẩu lưu bcrypt hash; JWT kiểm chữ ký/expiry theo cấu hình; phân quyền CUSTOMER/STAFF/MANAGER và sở hữu đơn. Không công khai secret trong source/log hoặc NEXT_PUBLIC_*. Unit/integration auth/roles kiểm một phần; scan/log/config runtime kiểm riêng. |
| NFR-03 | Giao diện di động/khả dụng sử dụng | Should | 375×812 và 1440×900: menu/chi tiết/giỏ/checkout không tràn ngang, thao tác chính dùng được; manifest hợp lệ. Không cam kết offline hay service worker production chỉ từ MSW/manifest. Finding tràn ngang còn tồn tại phải ghi chưa đạt. |
| NFR-04 | Khả năng triển khai | Must | URL web/API production truy cập HTTPS; có hướng dẫn local/build/deploy/rollback, cấu hình env, migration trước API start. HTTP 200 không tự xác nhận SHA, DB private hay CI gate. |
| NFR-05 | Health | Must | GET /health trả 200, status ok và database up khi DB sống; nguồn health có nhánh 503 khi dependency lỗi. Báo cáo phải phân biệt phép thử nhánh lỗi thật với unit dùng response giả. |

## 4. MoSCoW
- Must: FR-01–05, NFR-02, NFR-04, NFR-05.
- Should: FR-06–09, NFR-01, NFR-03.
- Could: FR-10, FR-11.
- Won't trong MVP: giao hàng, nhân sự, ngân hàng/MoMo/VNPAY thật, khuyến mãi và tích điểm. Các lớp Promotion/LoyaltyTransaction vẫn được mô hình hóa ở mức mở rộng vì Task 2.3 yêu cầu.

## 5. Use-case tổng quát
[Ảnh](../diagrams/usecase.svg) · [nguồn](../diagrams/usecase.puml). Kiểm tra JWT là bước bắt buộc; đăng nhập là luồng thay thế khi chưa có phiên, không bắt khách đăng nhập lại cho mọi checkout.

| Use-case | FR |
|---|---|
| UC-MENU | FR-01, FR-09 |
| UC-DETAIL | FR-02 |
| UC-CART | FR-03 |
| UC-AUTH | FR-04 |
| UC-CHECKOUT | FR-05; liên quan FR-03/04/07 |
| UC-HISTORY | FR-06 |
| UC-COUNTER | FR-07 |
| UC-CANCEL | FR-08 |
| UC-CATALOG | FR-10 |
| UC-REVENUE | FR-11 |

## 6. Trạng thái minh chứng
[Báo cáo QA 15/11](../testing/qa-report-2026-11-15.md), [summary](../testing/evidence/verification-summary.json), [measurement](../testing/evidence/menu-measurement.json). 285 test chức năng đạt không đồng nghĩa mọi NFR đạt: report còn finding tràn ngang chi tiết 375px; Compose bị BLOCKED vì thiếu Docker. Tài liệu được sửa để phản ánh đúng các kết quả đó.
