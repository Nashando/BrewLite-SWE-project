# Sprint Review — BrewLite

Cập nhật ngày 15/11/2026, Asia/Saigon. Mốc Sprint và tình trạng nghiệm thu do người dùng xác nhận; kết quả kỹ thuật dựa trên GitHub và lượt demo thực chạy ngày 15/11. Phản hồi kỹ thuật dưới đây do **Codex** ghi, không phải trích lời Trung Hiếu hoặc giảng viên.

## 1. Sprint 1 — Nền tảng và prototype menu

### 1.1. Thông tin

| Nội dung | Ghi nhận |
|---|---|
| Thời gian | **15/10–31/10/2026**, theo người dùng; ngày 31/10 là mốc chuyển sang Sprint 2 |
| Trạng thái | Giai đoạn đã kết thúc; **nhóm tự đánh giá Sprint 1 đã hoàn thiện**, chưa chốt nghiệm thu |
| Người góp ý chính | **Trung Hiếu**, theo người dùng; chưa có nội dung góp ý nguyên văn để trích dẫn |
| Phản hồi giảng viên | **Chưa có** |
| Ngày họp Review riêng | Chưa có thông tin xác nhận; không tự gán ngày 31/10 hoặc buổi 07/11 thành ngày họp Sprint 1 |
| Sprint Goal theo Assignment | Tạo nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và MVP đầu tiên chạy được cho luồng xem menu |

### 1.2. Increment và phạm vi tại mốc chuyển Sprint

Repo được tạo 15/10. Lịch sử có context/SRS/UML/ADR và deployment trong giai đoạn 16–30/10; README/env/DoD được bổ sung 31/10. Frontend menu/product/cart có commit **fec6d5e ngày 31/10**. Các tạo phẩm tồn tại ở lịch sử các nhánh; ngày viết code không đồng nghĩa ngày merge vào main. Xem [minh chứng E1/E2](sprint-evidence.md).

Bản frontend tại mốc này dùng **MSW mock**, chưa phải frontend đã tích hợp NestJS/PostgreSQL thật. Backend/migration xuất hiện 04/11, tích hợp API ở nhánh từ 06/11 và PR #24 merge main 10/11; đây là công việc trong Sprint 2 theo mốc thời gian người dùng vừa xác nhận. Không gán các kết quả đó ngược về Sprint 1.

### 1.3. Demo tái hiện ngày 15/11

Đã lấy đúng snapshot frontend **fec6d5e** từ Git, cài dependency theo lockfile, build production và thao tác bằng Chromium với mock gốc. Đây là **chạy lại bản lịch sử**, không phải bằng chứng đã chạy/được nghiệm thu ngày 31/10.

| Nội dung demo | Kết quả thực chạy |
|---|---|
| Xem menu | Hiển thị 11 món mock với tên, giá, danh mục và thông tin hết hàng |
| Lọc danh mục Trà | Hiển thị đúng 3 món |
| Món hết hàng | Trà sen vàng có nút Hết hàng bị vô hiệu, không thêm được |
| Tùy chọn/số lượng | Cà phê sữa đá 35.000 + size Lớn 12.000 + shot 10.000, số lượng 2 → **114.000đ** |
| Giỏ và reload | Lưu đúng tùy chọn/số lượng/tổng 114.000đ; giỏ còn sau tải lại |
| Phạm vi checkout | Chưa có link Đặt đơn; là ranh giới của prototype Sprint 1, không nhận là đã có checkout |
| Menu component tests gốc | **9/9 pass**, gồm loading/empty/error và các tình huống menu trong source |

Ảnh: [menu 375px](evidence/sprint-demo-2026-11-15/sprint1-menu-375.png), [giỏ](evidence/sprint-demo-2026-11-15/sprint1-cart.png). Số liệu/source/môi trường: [summary](evidence/sprint-demo-2026-11-15/summary.json).

### 1.4. Phản hồi sau demo — Codex

| Nhận xét | Căn cứ và hướng xử lý |
|---|---|
| Menu và trạng thái món đủ rõ để trình bày prototype | Giá và hết hàng hiển thị ngay; lọc danh mục và chọn món hoạt động trong lượt demo |
| Giỏ/tùy chọn có thể dùng làm nền cho checkout | Tính tiền đúng và giữ giỏ sau reload; tiếp tục dùng trong Sprint 2 |
| Cần phân biệt prototype và MVP tích hợp thật | MSW cung cấp dữ liệu; chưa kiểm chứng được products API/DB thật tại ngày 31/10. Chuyển phần backend/tích hợp sang Sprint 2 |
| Cần tách “có test/workflow” và “đã chạy/đã enforce CI” | Test menu được chạy lại 15/11; các run CI xanh/đỏ đã kiểm thuộc 06–07/11, không phải Sprint 1 |

Các nhận xét trên là đánh giá kỹ thuật mới. Người dùng chỉ xác nhận Trung Hiếu là người góp ý chính của Sprint 1; không tự coi nội dung trong bảng là lời Trung Hiếu đã phát biểu.

### 1.5. Đánh giá và chuyển tiếp

**Về đánh giá nội bộ:** nhóm cho biết Sprint 1 đã hoàn thiện, các phần việc được giao hoàn thành đúng hạn và được tích cực chỉnh sửa/review. **Về thời gian:** Sprint 1 kết thúc 31/10 theo nhóm xác nhận. **Về tạo phẩm:** có nền tảng/tài liệu và prototype frontend dùng được trong demo tái hiện. **Về nghiệm thu mục tiêu Assignment:** chưa đủ bằng chứng MVP web/API/DB thật và CI bắt buộc đã hoàn thành ngay tại mốc 31/10; không đánh dấu toàn bộ Task 4 đạt chỉ vì giai đoạn đã kết thúc. Giảng viên chưa phản hồi/chưa chốt nghiệm thu.

Phạm vi tiếp nối trong Sprint 2: backend products/auth/order/payment và migration, tích hợp web/API thật, checkout Ví/Thẻ, trạng thái/lịch sử đơn, kiểm thử tích hợp/E2E, CI/CD và delivery. Đây là đối chiếu giữa đề và lịch sử triển khai; không tự dựng số story point hoặc tỷ lệ hoàn thành từ số commit.

## 2. Sprint 2 — Review kết thúc Sprint

### 2.1. Thông tin

| Nội dung | Ghi nhận |
|---|---|
| Thời gian | **31/10–15/11/2026**, theo xác nhận của nhóm |
| Trạng thái | **Đã kết thúc ngày 15/11/2026**; kết quả kiểm chứng và nghiệm thu được ghi riêng |
| Sprint Goal theo Assignment | Hoàn thành end-to-end, tự động hóa đóng gói và triển khai một phiên bản production truy cập được |
| Mốc source demo mới | **main 9808d37**; code ứng dụng không sửa trong lượt demo |
| Người phản hồi demo mới | **Codex — nhận xét kỹ thuật từ thao tác trình duyệt và kiểm chứng API** |
| Giảng viên/nghiệm thu | Chưa có phản hồi giảng viên, chưa chốt nghiệm thu |

Thông tin cũ có buổi trao đổi 07/11. Với mốc Sprint vừa xác nhận, ngày này nằm trong Sprint 2; không dùng làm ngày kết thúc Sprint 2 và không gán demo 14–15/11 cho buổi đó.

### 2.2. Kết quả sản phẩm trên GitHub

| Task | Kết quả đã đạt | Minh chứng |
|---|---|---|
| 5.1 — MVP | Đã triển khai auth/JWT, giỏ/tùy chọn, Ví/Thẻ, đơn/quầy. Demo thành công Ví/quầy, Thẻ lỗi–thử lại và CASH | PR #24 merge 10/11; demo local tại main 9808d37 ngày 15/11 |
| 5.2 — Test/tích hợp | Báo cáo đã commit ghi nhận **285 test chức năng đạt**. Lượt demo mới chạy thành công 4 migration và seed 21 món | Báo cáo QA trên repo; summary.json và kết quả demo 15/11 |
| 5.3 — CD | Pipeline v1.0.1 chạy thành công quality → hook deploy → smoke test | CD run 43180620060; v1.0.1 tại SHA 2a544e7 |
| 5.4 — Delivery | Đã có URL, README/rollback, video demo và release notes trên repo | Các tạo phẩm bàn giao trên GitHub; liên kết trong sprint-evidence.md |

Bảng tổng hợp các kết quả đã đạt có bằng chứng; chi tiết phép đo và công việc sau Sprint ở mục 2.3–2.5. Kết thúc Sprint không thay thế xác nhận nghiệm thu.

Links commit/PR/run và báo cáo 285 test ở [sprint-evidence](sprint-evidence.md). Không cộng số test cũ vào demo mới hoặc gọi đó là một lượt test vừa chạy lại.

### 2.3. Demo thực chạy ngày 15/11

Môi trường riêng trên localhost: **Node 22.23.5, API build, Next.js production build, PostgreSQL 16.15 tạm**; 4 migration và seed 21 món thành công. Chromium thao tác UI; sau đó đọc API để đối chiếu trạng thái/số dư. Không ghi dữ liệu hoặc deploy production. Server/DB thử đã dừng và thư mục DB tạm đã được dọn.

| Kịch bản | Kết quả mới được quan sát/đối chiếu |
|---|---|
| Ví → quầy → khách theo dõi | **BL-0C086387**, 96.000đ, **COMPLETED / WALLET SUCCESS**; ví từ 200.000 còn **104.000đ** |
| Thẻ bị từ chối | **BL-F83CB3AB**, 45.000đ, **CANCELLED / CARD FAILED**; UI giữ giỏ và hiển thị lý do từ chối |
| Thử lại bằng thẻ hợp lệ | Tạo đơn khác **BL-B6C2060D**, 45.000đ, **PAID / CARD SUCCESS** |
| CASH tại quầy | **BL-AEE06F64**, 39.000đ, ban đầu chờ thanh toán; quầy xác nhận → **PAID / CASH SUCCESS** |
| Đo menu riêng | Median LCP local **48ms**, manifest hợp lệ; chỉ kết luận trong môi trường đo này |
| Kiểm tra layout riêng | Chi tiết ở 375×812: **scrollWidth 397 > innerWidth 375**, vẫn **FAIL**; không sửa assertion để làm xanh |

Ảnh: [Ví hoàn tất](evidence/sprint-demo-2026-11-15/sprint2-wallet-completed.png), [thẻ bị từ chối](evidence/sprint-demo-2026-11-15/sprint2-card-declined.png), [CASH đã thu](evidence/sprint-demo-2026-11-15/sprint2-cash-confirmed.png), [finding 375px](evidence/sprint-demo-2026-11-15/sprint2-product-375-finding.png). [Summary mới](evidence/sprint-demo-2026-11-15/summary.json), [measurement mới](evidence/sprint-demo-2026-11-15/menu-measurement.json).

### 2.4. Phản hồi sau demo — Codex

| Phản hồi | Nhận định và ưu tiên |
|---|---|
| Luồng đặt/thu Ví/pha chế/nhận hàng dùng cùng mã đơn | Quan sát được đầy đủ trên UI và trạng thái cuối qua API; đủ để demo nghiệp vụ chính |
| Thẻ lỗi có thông báo và đường thử lại rõ | UI giữ giỏ; API phân biệt đơn lỗi và đơn thử lại mới. Giữ cách giải thích này khi demo |
| CASH phân biệt đúng “chờ thu” và “đã thu” | Chỉ xác nhận PAID sau thao tác quầy; không trình bày CASH như đã thanh toán ngay lúc đặt |
| Responsive 375px phải sửa trước khi chốt bản cuối | Finding tái hiện trong phép đo mới; chuyển TV4 sửa, TV6 đo lại 375/1440 |
| Cần hoàn tất bằng chứng vận hành | Demo local không chứng minh Compose, production SHA/DB private hoặc đủ các bước CD |

Lượt demo này không kiểm lại toàn bộ unit/integration/E2E, bảo mật, race/idempotency hay mọi nhánh hủy/hoàn tiền. Các phần đó phải dùng đúng báo cáo test/source liên quan, không suy từ một demo thành mọi yêu cầu đều đạt.

### 2.5. Công việc theo dõi sau Sprint

| Công việc | Phụ trách theo phân công | Tiêu chí chốt |
|---|---|---|
| Sửa responsive và đo lại | TV4; TV6 xác minh | Không tràn ngang 375/1440; report ghi source sau sửa |
| Compose thực chạy | TV6 + TV3 | Log web/API/DB khởi động, migration/seed, health/test và cleanup; kết quả passed |
| App image/tag và CD đúng phiên bản | TV3; TV6 review | Log build image tag SHA/semver, deploy/migration/smoke theo phiên bản thật; push registry nếu nền tảng yêu cầu |
| DB private/secret/runtime SHA | TV3/người có quyền nền tảng | Minh chứng config/deployment; không thay bằng HTTP 200 |
| Chốt source, notes/tag và hồ sơ | TV3 + TV6; TV1 review | Notes đúng mốc, không ghi đè tag cũ; Review/Retro thể hiện đúng kết quả và quyết định nhóm |

Nhóm xác nhận Sprint 2 đã kết thúc ngày 15/11/2026. Bảng này cụ thể hóa các phần kỹ thuật còn mở theo phân công hiện có; hạn xử lý sau Sprint chưa được cung cấp, các biện pháp cụ thể là đề xuất. Giảng viên chưa phản hồi/chưa chốt nghiệm thu.

Theo nhóm, các thành viên hoàn thành phần việc được giao đúng hạn và tích cực sửa/review; khó khăn chính là giao tiếp/cập nhật vì khó sắp lịch bàn bạc trực tiếp. Các biện pháp cải thiện giao tiếp cụ thể là đề xuất; Retrospective được giữ ở hồ sơ local theo phạm vi bàn giao hiện tại.

## 3. Kết luận hiện tại

- Sprint 1: đã kết thúc giai đoạn theo mốc nhóm xác nhận; prototype frontend được tái hiện thành công, nhưng không nhận là đã hoàn tất mọi tiêu chí Task 4 tại ngày 31/10.
- Sprint 2: đã kết thúc ngày 15/11/2026; demo luồng chính thành công, các finding và minh chứng vận hành còn mở được theo dõi sau Sprint.
- Nhận xét mới là của Codex. Trung Hiếu là người góp ý chính Sprint 1 theo người dùng; không có phản hồi giảng viên hoặc quyết định nghiệm thu để tự ghi thêm.
