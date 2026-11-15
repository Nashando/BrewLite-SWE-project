# Sprint Retrospective — BrewLite

Retrospective chung cho Sprint 1 (15/10–31/10/2026) và Sprint 2 (31/10–15/11/2026). Phần "Ý kiến nhóm" lấy từ nội dung nhóm đã xác nhận trong [Sprint Review](sprint-review.md) mục 2.5. Các mục `TODO` là quyết định nhóm cần chốt; không tự điền thay nhóm.

| Mục | Nội dung |
|---|---|
| Ngày họp | 15/11/2026 |
| Thành phần | Võ Nguyễn Đại Thành, Phạm Anh Khôi, Huỳnh Thiên Tường, Hồ Nguyễn Trung Hiếu, Nguyễn Võ Gia Bảo |
| Kỹ thuật | Start / Stop / Continue |

## Dữ liệu từ repository (đầu vào thảo luận)

| Quan sát | Số liệu | Nguồn |
|---|---|---|
| Pull request | 26 PR (#1–#27, không có #5): 14 được merge, 12 đóng không merge | [Pull requests](https://github.com/Nashando/BrewLite-SWE-project/pulls?q=is%3Apr) |
| Revert | 4 PR revert: #4 được merge; #16, #21, #22 đóng không merge | PR list |
| PR mở lâu | PR #2 và #6 (tài liệu Task 1) mở từ 19/10, merge 07–08/11 | PR #2, #6 |
| Commit thẳng lên `main` | 14–15/11 có nhiều commit tài liệu đẩy thẳng lên `main`, không qua PR | [Lịch sử commit](https://github.com/Nashando/BrewLite-SWE-project/commits/main) |
| Chuyển tiếp Sprint | Backend/API thật và CI hoàn tất ở Sprint 2 dù thuộc mục tiêu Sprint 1 | [Product Backlog](product-backlog.md) PB-07, PB-10 |
| CI | Lỗi lint được CI phát hiện và sửa trước khi mở PR (06/11) | [ci-evidence.md](../testing/ci-evidence.md) |
| CD | Run CD đầu tiên cho v1.0.1 thất bại (11/11), run sau thành công (12/11) | [Actions](https://github.com/Nashando/BrewLite-SWE-project/actions/workflows/cd.yml) |
| Chất lượng | 285 test chức năng đạt (QA report); Compose chạy thật 66/66 test đạt (15/11); 1 finding layout 375 px chưa sửa | [QA report](../testing/qa-report-2026-11-15.md), [Compose](../testing/evidence/compose-codespaces/README.md) |

## Điều làm tốt — Continue

- Theo nhóm: các thành viên hoàn thành phần việc được giao đúng hạn và tích cực chỉnh sửa, review.
- Kiểm thử chạy trên hệ thống thật (PostgreSQL, Docker Compose), có test đồng thời cho tồn kho và idempotency thanh toán.

## Điều chưa tốt — Stop

- Theo nhóm: khó khăn chính là giao tiếp và cập nhật tiến độ vì khó sắp lịch bàn bạc trực tiếp.
- Đẩy thẳng tài liệu lên `main` bỏ qua PR và review; nhiều PR trùng nhánh rồi đóng hoặc revert.


