# Đối chiếu mục 2–3 checklist với Assignment 2

Source đối chiếu: main 9808d37 (TV6 QA), ngày 15/11/2026. Các sửa đổi lần này chỉ là tài liệu/PlantUML/ảnh, không sửa app/test/workflow.

## Phạm vi theo đề
Mục 2 checklist là SRS, use-case và ma trận truy vết; mục 3 là activity/sequence/class/deployment. Đây không phải số Task 2/3 của đề: nó bao trùm Task 1.1–1.3, Task 2.1–2.3 và Task 3.1–3.2 cùng phần truy vết.

| Yêu cầu đề | Tạo phẩm/điểm kiểm tra |
|---|---|
| Task 1.1: stakeholder, scope, giả định/ràng buộc | context-and-scope.md giữ 6 nhóm stakeholder; làm rõ MVP, chức năng đã có và domain mở rộng chưa triển khai |
| Task 1.2: FR/NFR, MoSCoW, AC, use-case tổng quát | SRS.md định nghĩa 11 FR/5 NFR và phép kiểm chứng; usecase.puml/svg khớp mã FR, phân biệt JWT với đăng nhập và module thanh toán nội bộ |
| Task 1.3: actor/trigger/pre/post, main/alternative/exception, link FR | UC-CHECKOUT và usecase-checkout.puml/svg; phân biệt 400/402/mạng, CASH chờ quầy và TTL theo request |
| Task 2.1: start/end, user/system, swimlane, decision success/fail, hết hàng/chưa login/payment fail | activity.puml/svg có đủ các nhánh; cả CASH/quầy và idempotency; không mô tả timer nền không có trong code |
| Task 2.2: Customer/UI/API/DB/Payment, JWT/DTO, transaction/kho, alt, idempotency, kết quả | sequence.puml/svg có 5 lifeline tối thiểu và actor quầy; cấu trúc actor/boundary/control/entity, activation, loop kho, alt replay/race/402/CASH; kiểm JWT/DTO và điều kiện mở transaction; PaymentService là module nội bộ |
| Task 2.3: User/Product/Order/OrderItem/Payment/Promotion/LoyaltyTransaction, thuộc tính/enum/quan hệ/multiplicity | class.puml/svg có lớp ba ngăn, dấu truy cập/kiểu dữ liệu và quan hệ; ghi rõ nullable/snapshot, hành vi domain ánh xạ về service/helper và mô hình mở rộng chưa có bảng/API |
| Task 3.1: C4/phân lớp, Next/Nest/Postgres/migration/payment/log/config/trade-off, ADR | Architecture Document.md và ADR005/007 được làm rõ theo source; không ghi offline/GHCR là đã thực thi khi source chưa có |
| Task 3.2: client/web/API/DB persistent, registry/platform, HTTPS/ports/env/health/log/local-CI-prod | deployment-diagram.puml/svg: Vercel + Render Node Git runtime, DB, GitHub Actions thực tế; Docker Hub phục vụ base images local. Không vẽ Actions push GHCR/Render pull app image không có trong workflow |
| Truy vết yêu cầu → UC → thiết kế → code → test | traceability-matrix.md theo đúng mẫu mục 8.1 của đề: Mã yêu cầu, Use-case/User Story, Thiết kế/Sơ đồ, Code/API, Test. Use-case và thiết kế ở hai cột riêng; giữ 16 mã yêu cầu và thứ tự FR/NFR, liên kết tới code/test hiện có |

## Các sửa đổi dựa trên code
- POST /orders tạo và giữ kho; PaymentService 402 commit FAILED/CANCELLED/hoàn kho, không giữ đơn chờ để trả lại; 400/mạng có hậu điều kiện khác.
- TTL theo releaseExpiredOrders khi request liên quan, không có timer/cron.
- Quầy GET /orders/all; PATCH status chỉ sau PAID; confirm-cash riêng; MANAGER là role đúng, không có ADMIN.
- Catalog ẩn isActive, không có DELETE/cấm ẩn khi có đơn PENDING; giỏ UI localStorage, không mặc định đồng bộ Cart API.
- Class Promotion/LoyaltyTransaction là mô hình domain mở rộng theo đề, không tạo yêu cầu/test/code giả.
- Paths và liên kết kiểm tra từ repo root/vị trí file; manifest.webmanifest là file thực.

## Phân biệt sửa tài liệu và hoàn thành triển khai
Tài liệu phản ánh yêu cầu và code, không được tự ghi mọi yêu cầu đã nghiệm thu. Báo cáo QA trên main có 285 test chức năng đạt, nhưng layout chi tiết 375px còn FAIL và Docker Compose BLOCKED.

Task 5.3 của đề vẫn yêu cầu app image có tag SHA/semver và chuỗi đóng gói/triển khai: cd.yml ở main hiện chưa có job build/push app image. Docker Hub base images trong deployment diagram không được dùng để tuyên bố phần app image/GHCR đã đạt. Bổ sung job và run/digest thật là thay đổi pipeline riêng, không thể hoàn thành bằng cách sửa nhãn sơ đồ.

Tương tự, DB private/backup/secret runtime, required CI checks, SHA production cần bằng chứng nền tảng. Lượt sửa mục 2–3 này không deploy hoặc tự thay Settings. Không dùng số dấu tick để che các phần vận hành còn thiếu.

## Kiểm tra tạo phẩm
Nguồn .puml và ảnh .svg được render cùng lượt; kiểm tra cú pháp PlantUML, link nội bộ, FR/NFR/UC, đường dẫn code/test và diff chỉ trong docs. Không chạy lại suite ứng dụng vì source/test/workflow không đổi; dùng bằng chứng có phiên bản đã nằm trên main, không nhận là lượt test mới của tài liệu.
