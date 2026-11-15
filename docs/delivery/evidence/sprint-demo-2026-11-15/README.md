# Demo bổ sung cho Sprint Review — 15/11/2026

Người dùng yêu cầu chạy demo để Codex tự ghi phản hồi kỹ thuật. Đây không phải trích lời Trung Hiếu/giảng viên, biên bản họp hoặc kết luận nghiệm thu. Sprint 1 kết thúc giai đoạn 31/10; Sprint 2 diễn ra 31/10–15/11 và đã kết thúc theo xác nhận mới của nhóm.

## Nguồn và môi trường

- Sprint 1: frontend snapshot fec6d5e ngày 31/10, dependency theo lockfile, Next.js production build, MSW mock gốc. Tái hiện ngày 15/11, không nhận là một lượt test đã chạy trong tháng 10. Snapshot thuộc nhánh phát triển, không tự coi là trạng thái main tại ngày chốt.
- Sprint 2: main 9808d37, Node 22.23.5, API/web production build và PostgreSQL 16.15 tạm trên loopback; migration/seed thật, payment mô phỏng. Không sử dụng production. Server và DB thử đã dọn sau chạy.
- [Summary](summary.json) ghi nguồn, thời điểm UTC, môi trường, kết quả và giới hạn; [measurement](menu-measurement.json) là phép đo NFR riêng.

## Ảnh đối chiếu

| Ảnh | Nội dung |
|---|---|
| [Sprint 1 menu](sprint1-menu-375.png) | 11 món mock, giá/danh mục/hết hàng |
| [Sprint 1 giỏ](sprint1-cart.png) | Cà phê sữa đá + size Lớn + shot, số lượng 2, tổng 114.000đ còn sau reload |
| [Sprint 2 Ví](sprint2-wallet-completed.png) | BL-0C086387, 96.000đ, COMPLETED |
| [Sprint 2 thẻ lỗi](sprint2-card-declined.png) | Thông báo từ chối, giữ giỏ và thao tác thử lại |
| [Sprint 2 CASH](sprint2-cash-confirmed.png) | Quầy xác nhận đã thu tiền |
| [Finding chi tiết 375px](sprint2-product-375-finding.png) | Phép đo scrollWidth 397 > 375, giữ trạng thái FAIL |

Sprint 1 có 9/9 menu component tests gốc chạy lại đạt. Sprint 2 demo Ví/quầy/thẻ lỗi–thử lại/CASH thành công và đối chiếu API. Không cộng lượt demo này thành một lượt mới của suite 285 test đã có trong báo cáo QA.

Phép đo mới: median LCP local 48ms, manifest hợp lệ; layout FAIL, script đo exit 1. Không kết luận mọi NFR đạt hoặc production cùng SHA từ demo local.

Lượt đầu của script có lỗi bộ chọn nút và đường dẫn module; đã lưu riêng và sửa script, không sửa app. Bộ ảnh/summary ở đây thuộc lượt cuối thành công; finding giao diện không bị sửa thành PASS. Full log, snapshot lịch sử và các lượt đầu giữ riêng trong output local, không phải dependency cần để chạy dự án sau clone.
