# Minh chứng cho Sprint Review và Retrospective — BrewLite

Ngày đối chiếu: 15/11/2026, Asia/Saigon. GitHub main được xác minh qua API tại **9808d37f42fe9e1b9f747f5786286928327135ef**. Tệp này ghi bằng chứng kỹ thuật; không thay biên bản quyết định, phản hồi stakeholder hoặc ngày bắt đầu/kết thúc Sprint do nhóm xác nhận.

## Quy ước sử dụng bằng chứng

- Ngày commit có thể thuộc nhánh phát triển, khác ngày merge vào main. Không dùng ngày viết code để tự nhận đã tích hợp/nghiệm thu cùng ngày.
- Có file test không đồng nghĩa test đã chạy thành công. Có workflow không đồng nghĩa đủ bước CD hoặc enforce CI trên main.
- Kết quả bổ sung sau ngày chốt Sprint được ghi là follow-up, không gán ngược vào Review trước đó. Mốc Sprint đã được người dùng xác nhận ở E0; trải nghiệm và mục tiêu nhóm bổ sung được ghi ở E0.
- Dùng vai trò TV1–TV6 theo phân công của nhóm; tên tác giả Git không tự được ánh xạ thành một TV hoặc dùng để suy ra người tham dự họp.

## E0. Thông tin do người dùng xác nhận

- Sprint 1 bắt đầu khi tạo GitHub **15/10**, kết thúc **31/10/2026**.
- Sprint 2 diễn ra **31/10–15/11/2026** và đã kết thúc theo xác nhận mới của nhóm. Ngày 31/10 là mốc chuyển tiếp; không tự suy ra giờ chốt hoặc cách chia công việc trong ngày.
- Người góp ý chính Sprint 1: **Trung Hiếu**. Chưa có nội dung góp ý nguyên văn, không gán nhận xét mới của Codex cho Trung Hiếu.
- Giảng viên chưa phản hồi và chưa chốt nghiệm thu.
- Người dùng yêu cầu Codex chạy demo và tự ghi phản hồi kỹ thuật; sau đó đã bổ sung: nhóm hoàn thành phần việc được giao đúng hạn, tích cực chỉnh sửa/review tốt; khó khăn chính là giao tiếp/cập nhật vì không sắp xếp được lịch bàn bạc trực tiếp.
- Theo người dùng: **Sprint 1 hoàn thiện**; **Sprint 2 đã kết thúc ngày 15/11**. Đây là xác nhận của nhóm về mốc Sprint, không phải bằng chứng mọi tiêu chí kỹ thuật hoặc nghiệm thu giảng viên đã đạt. Các biện pháp giao tiếp cụ thể và chi tiết kế hoạch kỹ thuật chưa được cung cấp là quyết định họp, nên được ghi là đề xuất.

## E1. Nền tảng repo và tài liệu

| Mốc có commit | Tạo phẩm có thể xác minh | Bằng chứng |
|---|---|---|
| 15/10 | Khởi tạo repo; sau đó có apps/web, apps/api, docs, env example và README | [Initial commit](https://github.com/Nashando/BrewLite-SWE-project/commit/636dacea4a3d7e406ad61626ea3f15211c1d759d) |
| 16/10 | Context/scope | [8d8effa](https://github.com/Nashando/BrewLite-SWE-project/commit/8d8effa087d233474521b93b920ca9db142e84fe) |
| 19/10 | SRS rút gọn | [de9bf5d](https://github.com/Nashando/BrewLite-SWE-project/commit/de9bf5d54e77ce0c13e7f980f30d3c42227f991c) |
| 23/10 | UML ban đầu | [ee173c0](https://github.com/Nashando/BrewLite-SWE-project/commit/ee173c00f30d6db11f77a619494220ea62cefc2b) |
| 29–30/10 | ADR và deployment diagram | [ADR](https://github.com/Nashando/BrewLite-SWE-project/commit/0e99fbc88cd57f606a02970b4f9e4d84af2e527c), [deployment](https://github.com/Nashando/BrewLite-SWE-project/commit/688a0761d79a661b6786e38e182a05e00335cc86) |
| 31/10 | README/env/ADR/Definition of Done | [71183c7](https://github.com/Nashando/BrewLite-SWE-project/commit/71183c7241ebeac22f2006b50e78ac6ae35c9262) |

Các tài liệu sau đó còn được sửa/merge. Ngày nêu trên không chứng minh hồ sơ đã thống nhất hoặc hoàn chỉnh ngay lần đầu.

## E2. Menu MVP và backend

- [fec6d5e — 31/10](https://github.com/Nashando/BrewLite-SWE-project/commit/fec6d5e2897696b67fbf6ad6fb3587e0cb2a149b): Next.js menu/product/cart, trạng thái loading/empty/error, test component và workflow CI ban đầu. Có MSW/mock frontend ở giai đoạn này; không dùng commit này làm chứng cứ API/DB thật đã tích hợp.
- [1cdbd86 — 04/11](https://github.com/Nashando/BrewLite-SWE-project/commit/1cdbd863be3cb784aaab54ba57fc787d0509f9b6): NestJS API, products/auth/order/payment; [a8b7e12](https://github.com/Nashando/BrewLite-SWE-project/commit/a8b7e12c382ba362539640020f871110d549fa72): migration khởi tạo.
- [9514663 — 06/11](https://github.com/Nashando/BrewLite-SWE-project/commit/95146635580fe881afeb52d3f13cec8b48e4f695): khớp web với backend thật. [ffcc1f8](https://github.com/Nashando/BrewLite-SWE-project/commit/ffcc1f8149bafdc93fd9bc0ed44ee9a7e47aac0a): xử lý thứ tự cập nhật kho để tránh deadlock.

## E3. Luồng end-to-end và phạm vi thanh toán

- Auth, giỏ, checkout/order/payment, lịch sử/trạng thái, quầy và quản lý có trong [PR #24](https://github.com/Nashando/BrewLite-SWE-project/pull/24), merge **10/11/2026 21:21:06** tại main `7819671`.
- [b8b4d5b — 07/11](https://github.com/Nashando/BrewLite-SWE-project/commit/b8b4d5bc632b6ae0d66fd0fd5a24d631034e4e2a) chuyển thanh toán về Ví/Thẻ mô phỏng theo đề, CASH là mở rộng. Không ghi MoMo/VNPAY thật là tính năng hoàn thành.
- [970e84a — 07/11](https://github.com/Nashando/BrewLite-SWE-project/commit/970e84a9311d3f69786fcd22bec990aa9b6adeeb) thêm integration/E2E trong tests. Đây là bằng chứng thêm source test, không phải kết quả test ngày 07/11.
- [PR #18](https://github.com/Nashando/BrewLite-SWE-project/pull/18) từng merge 09/11 00:47:16, sau đó bị revert 10/11 (`b0f19c2`). Không đếm tạo phẩm trong PR đó như một bộ hiện còn độc lập trên main. Bộ tests hiện hành được đối chiếu từ source main và báo cáo QA.

## E4. CI và quy trình tích hợp

- [CI đỏ 06/11](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/42245519278), head `fb9dabe`, event push, conclusion failure; [CI xanh 07/11](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/42391516059), head `284c19b`, event pull_request, conclusion success.
- [PR #15](https://github.com/Nashando/BrewLite-SWE-project/pull/15) có minh chứng CI xanh/đỏ, merge 09/11 01:32:21; sau đó bị revert 10/11 (`7123fc1`). Không suy từ PR merge cũ rằng main hiện có đúng toàn bộ workflow của PR đó.
- [CI tại head bf10fc2 của PR #27](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/43464677033) success, event push; main sau squash là `ba3b7f6`. Không đổi nhãn event thành pull_request hoặc gán SHA run sang SHA squash.
- CI và Secret scan main `9808d37` đều success: [CI](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/43622351976), [Secret scan](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/43622352033).
- API nhánh main trả protected=false. [Ruleset protection-2](https://github.com/Nashando/BrewLite-SWE-project/rules/27123405) áp dụng refs/heads/protection, required_status_checks rỗng; CI xanh chưa chứng minh bắt buộc chặn merge khi fail.
- Review records đã đọc: PR #24 có COMMENTED, chưa có APPROVED trong danh sách đó; PR #27 chưa có review submission. Điều này không chứng minh nhóm không thảo luận/review qua kênh khác.

## E5. Desktop, seed và tài liệu sau tích hợp

- [PR #25](https://github.com/Nashando/BrewLite-SWE-project/pull/25), merge **12/11 15:37:45**, bổ sung desktop layout. [45904db](https://github.com/Nashando/BrewLite-SWE-project/commit/45904db5caead2aece7ec963a04ba29425d4ef14) thêm desktop E2E; [9258d3f](https://github.com/Nashando/BrewLite-SWE-project/commit/9258d3faa80b4c91b1d6c2702c40cc438f1a8d8e) tăng seed lên 21 món.
- [PR #27](https://github.com/Nashando/BrewLite-SWE-project/pull/27), merge **13/11 23:42:49**, cập nhật kiến trúc/ADR007/deployment/README.
- [2d5721c — 14/11](https://github.com/Nashando/BrewLite-SWE-project/commit/2d5721c18691be24cb04e4586c6e2003441aed18) đã đưa release notes mới lên repo; file hiện ghi mốc nội dung f832448, không phải chưa có release notes.

## E6. Báo cáo QA được lưu trong commit

[9808d37 — 15/11](https://github.com/Nashando/BrewLite-SWE-project/commit/9808d37f42fe9e1b9f747f5786286928327135ef) thêm báo cáo/bằng chứng QA, verifier Compose, helper test và demo. [Báo cáo QA](../testing/qa-report-2026-11-15.md) dùng nền app 4c171df cộng thay đổi QA chọn lọc; app giống main 9808d37, Node 22.23.5, PostgreSQL 16.15, API/web build production.

| Bộ kiểm thử | Pass | Fail |
|---|---:|---:|
| API Jest | 56 | 0 |
| Frontend Vitest | 163 | 0 |
| Unit helper QA | 8 | 0 |
| Integration PostgreSQL | 38 | 0 |
| E2E mobile/desktop | 20 | 0 |
| **Tổng chức năng** | **285** | **0** |

Các số trên là nội dung báo cáo đã commit, không phải suite vừa chạy lại trong lượt soạn Review. [Summary](../testing/evidence/verification-summary.json) ghi 4 migration/seed 21 món; không retry/skipped/flaky. [Measurement](../testing/evidence/menu-measurement.json) ghi menu LCP local trung vị 76ms nhưng chi tiết sản phẩm 375px tràn ngang 397px, layout FAIL. [Compose result](../testing/evidence/compose-result.json) là BLOCKED vì thiếu Docker trong môi trường thử; schema hợp lệ và test ngoài Docker không thay bằng chứng Compose chạy thật.

## E7. Demo

[Demo evidence](demo-evidence.md) và MP4/SRT đã nằm trên GitHub trong commit 9808d37. Video quay ngày 14/11, source ba3b7f6, 03:56, API/PostgreSQL local thật, Next dev và payment mô phỏng. Có Ví → COMPLETED, thẻ lỗi CANCELLED rồi tạo đơn mới PAID, CASH được quầy xác nhận. Không gán video này cho buổi Review 07/11 hoặc deployment production.

## E8. Release, CD và giới hạn vận hành

- Tag v1.0.0 trỏ commit `25f710da802f62d6f6c9e6e8054d97ddcba03e5f`; v1.0.1 trỏ `2a544e7e946bc75f171c9873afd24152954ca685`. Chưa có tag ở main 9808d37 trong lượt đối chiếu.
- [CD run 43180620060](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/43180620060), v1.0.1, SHA 2a544e7, success. Không dùng run này chứng minh main 9808d37 đã được deploy.
- Source cd.yml main chỉ thực thi quality → deploy-api hook ref SHA → smoke GET. Chưa có bước tạo/tag app Docker image theo Task 5.3; push registry theo điều kiện nền tảng, không mặc định bắt GHCR.
- Có hướng dẫn rollback thủ công trong [deployment](../deployment.md); đề không bắt rollback tự động.
- GET web/API/health đã được kiểm tra riêng ngày 15/11 trong hồ sơ local: có lượt timeout đầu và GET lại 200, DB up. Đây là kiểm tra khả dụng sau các Sprint, không xác nhận SHA, DB private hoặc secret runtime. Bằng chứng ngoài commit này không được ghi như đã có trên GitHub.

## E9. Những điều GitHub không tự xác nhận

Ngày/giờ Sprint và cuộc họp; Sprint Goal thực sự nhóm đã thống nhất; danh sách công việc cam kết tại planning; ai tham dự; đã demo gì trong từng buổi; phản hồi giảng viên/nhóm; quyết định chấp nhận; mức hài lòng; khó khăn giao tiếp và nguyên nhân; hành động cải tiến đã được thống nhất cùng chủ nhiệm/hạn. Không tính velocity hoặc tỷ lệ hoàn thành từ số commit khi chưa có Sprint Backlog/ước lượng.

Danh sách issue endpoint đã đọc chỉ là một trang kết quả; chưa thu được backlog Sprint được xác nhận. Không dùng điều này để khẳng định repo không có board hoặc công việc ở công cụ khác.

## E10. Demo thực chạy bổ sung ngày 15/11

Đây là lượt mới để Codex ghi nhận xét, được người dùng yêu cầu; không phải cuộc họp nghiệm thu hoặc lượt chạy lại toàn bộ 285 test.

- Sprint 1: snapshot frontend **fec6d5e (31/10)**, build production, MSW mock gốc. Menu 11 món, lọc Trà 3 món, hết hàng bị chặn; tùy chọn/số lượng và reload giỏ giữ tổng **114.000đ**. Menu component tests gốc **9/9 pass**. Snapshot thuộc lịch sử nhánh phát triển, không tự gọi là main của ngày 31/10.
- Sprint 2: main **9808d37**, Node 22.23.5, 4 migration/seed 21 món, API/web production build, PostgreSQL 16.15 tạm. Ví **BL-0C086387** COMPLETED, thẻ lỗi **BL-F83CB3AB** CANCELLED, thẻ thử lại **BL-B6C2060D** PAID, CASH **BL-AEE06F64** PAID sau quầy xác nhận; ví còn 104.000đ.
- Phép đo độc lập mới có LCP menu local **48ms** và manifest hợp lệ, nhưng layout chi tiết **397>375**, exit 1. Không thay số liệu 76ms của report cũ bằng số liệu này hoặc nhận là cloud production đạt.
- Lượt đầu có lỗi script demo về nhãn nút hết hàng và đường dẫn Playwright. Các script được sửa; app không sửa; các lượt lỗi lưu riêng ngoài repo. Lượt cuối demo thành công, finding layout được giữ FAIL. Các server/DB tạm đã dọn.

[Summary nguồn/môi trường/kết quả](evidence/sprint-demo-2026-11-15/summary.json), [measurement mới](evidence/sprint-demo-2026-11-15/menu-measurement.json), [ảnh và ghi chú](evidence/sprint-demo-2026-11-15/README.md).
