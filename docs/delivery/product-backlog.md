# Product Backlog — BrewLite

Backlog lấy từ [SRS](../requirements/SRS.md). Mỗi mục là một user story, gắn mã yêu cầu, ưu tiên MoSCoW, Sprint thực hiện và PR/commit đã hiện thực. Bảng này là bản sao kiểm soát phiên bản của issue board.

> **Cần làm trên GitHub:** tạo GitHub Project (Board) "BrewLite Backlog" với các cột *Backlog → Sprint 1 → Sprint 2 → In progress → Review → Done*, tạo một issue cho mỗi dòng dưới đây và đính link Project vào đây: `<!-- TODO: dán link GitHub Project -->`

Mốc Sprint theo [Sprint Review](sprint-review.md): Sprint 1 từ 15/10 đến 31/10/2026, Sprint 2 từ 31/10 đến 15/11/2026. Cột "Sprint" ghi Sprint mà hạng mục thực sự hoàn tất; hạng mục kế hoạch ở Sprint 1 nhưng xong ở Sprint 2 ghi là *chuyển tiếp*.

## Sprint 1 — Nền tảng và MVP xem menu (15/10–31/10)

Sprint Goal: tạo nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và MVP đầu tiên chạy được cho luồng xem menu.

| ID | User story | Yêu cầu | Ưu tiên | Người phụ trách | Trạng thái | Minh chứng |
|---|---|---|---|---|---|---|
| PB-01 | Là nhóm, tôi cần tài liệu bối cảnh, stakeholder và phạm vi | Task 1.1 | Must | TV1 | Done | [PR #2](https://github.com/Nashando/BrewLite-SWE-project/pull/2), `docs/requirements/context-and-scope.md` |
| PB-02 | Là nhóm, tôi cần SRS có FR/NFR, MoSCoW và tiêu chí chấp nhận | Task 1.2 | Must | TV1 | Done | [PR #6](https://github.com/Nashando/BrewLite-SWE-project/pull/6), `docs/requirements/SRS.md` |
| PB-03 | Là nhóm, tôi cần đặc tả UC-CHECKOUT | Task 1.3 | Must | TV1 | Done | `docs/requirements/use-case-checkout.md` |
| PB-04 | Là nhóm, tôi cần activity, sequence, class diagram | Task 2 | Must | TV2 | Done | [PR #7](https://github.com/Nashando/BrewLite-SWE-project/pull/7), `docs/diagrams` |
| PB-05 | Là nhóm, tôi cần mô tả kiến trúc, ADR và deployment diagram | Task 3 | Must | TV3 | Done | [PR #1](https://github.com/Nashando/BrewLite-SWE-project/pull/1), [PR #10](https://github.com/Nashando/BrewLite-SWE-project/pull/10), `docs/architecture` |
| PB-06 | Là nhóm, tôi cần monorepo, README, `.env.example`, quy ước commit và DoD | Task 4.1 | Must | TV3 | Done | [PR #10](https://github.com/Nashando/BrewLite-SWE-project/pull/10), `docs/commit-and-dod.md` |
| PB-07 | Là nhóm, tôi cần CI chạy Install → Lint → Unit test → Build trên mỗi PR | Task 4.4 | Must | TV3 | Done ở Sprint 2 (chuyển tiếp) | [PR #15](https://github.com/Nashando/BrewLite-SWE-project/pull/15) merge 08/11, `.github/workflows/ci.yml`, [ci-evidence.md](../testing/ci-evidence.md) |
| PB-08 | Là khách, tôi muốn xem menu và lọc theo danh mục (prototype dữ liệu MSW) | FR-01, FR-09 | Must | TV4 | Done | Commit `fec6d5e` ngày 31/10, `apps/web/src/features/menu`; demo tái hiện trong [Sprint Review](sprint-review.md) mục 1.3 |
| PB-09 | Là khách, tôi muốn thấy trạng thái đang tải, menu trống và lỗi | FR-01 | Must | TV4 | Done | `MenuSkeleton.tsx`, `MenuEmpty.tsx`, `MenuError.tsx`; 9/9 test menu |
| PB-10 | Là khách, tôi muốn menu lấy từ API thật `GET /products`, `GET /products/:id` có migration và seed | FR-01, FR-02, Task 4.3 | Must | TV5 | Done ở Sprint 2 (chuyển tiếp) | Backend từ 04/11, `apps/api/src/products`, `apps/api/prisma`, [PR #24](https://github.com/Nashando/BrewLite-SWE-project/pull/24) |

## Sprint 2 — Luồng end-to-end, CI/CD và bàn giao (31/10–15/11)

Sprint Goal: hoàn thành luồng end-to-end, tự động hóa đóng gói và triển khai một phiên bản production có thể truy cập được.

| ID | User story | Yêu cầu | Ưu tiên | Người phụ trách | Trạng thái | Minh chứng |
|---|---|---|---|---|---|---|
| PB-11 | Là khách, tôi muốn xem chi tiết món, chọn size và topping | FR-02 | Must | TV4, TV5 | Done | `apps/web/src/features/product`, `GET /products/:id` |
| PB-12 | Là khách, tôi muốn quản lý giỏ hàng và thấy tổng tiền | FR-03 | Must | TV4 | Done | `apps/web/src/features/cart` |
| PB-13 | Là khách, tôi muốn đăng ký, đăng nhập bằng JWT | FR-04 | Must | TV4, TV5 | Done | `apps/api/src/auth`, `apps/web/src/features/auth` |
| PB-14 | Là khách, tôi muốn đặt đơn và thanh toán Ví/Thẻ mô phỏng an toàn | FR-05 | Must | TV4, TV5 | Done | `POST /orders`, `POST /payments`, [PR #24](https://github.com/Nashando/BrewLite-SWE-project/pull/24) |
| PB-15 | Là khách, tôi muốn xem lịch sử và trạng thái đơn | FR-06 | Should | TV4, TV5 | Done | `apps/web/src/features/orders` |
| PB-16 | Là nhân viên, tôi muốn cập nhật trạng thái đơn và xác nhận tiền mặt | FR-07 | Should | TV4, TV5 | Done | `apps/web/src/features/staff`, `PATCH /orders/:id/status` |
| PB-17 | Là khách, tôi muốn hủy đơn chưa pha chế | FR-08 | Should | TV5 | Done | `POST /orders/:id/cancel` |
| PB-18 | Là quản lý, tôi muốn quản lý món, topping, tồn kho | FR-10 | Could | TV4, TV5 | Done | `apps/web/src/features/admin`, `/admin/*` |
| PB-19 | Là quản lý, tôi muốn xem doanh thu | FR-11 | Could | TV4, TV5 | Done | `GET /admin/reports/revenue` |
| PB-20 | Là nhóm, tôi cần unit, integration và E2E test | Task 5.2 | Must | TV6 | Done | [PR #18](https://github.com/Nashando/BrewLite-SWE-project/pull/18), `tests/`, [QA report](../testing/qa-report-2026-11-15.md) |
| PB-21 | Là nhóm, tôi cần `docker-compose.yml` chạy web, API, DB và `GET /health` | Task 5.2, NFR-05 | Must | TV3, TV5, TV6 | Done | `docker-compose.yml`, `apps/api/src/health`; chạy thật trên Codespaces 15/11: [compose-codespaces](../testing/evidence/compose-codespaces/README.md) |
| PB-22 | Là nhóm, tôi cần CD: build image, push registry, deploy, smoke test, rollback | Task 5.3, NFR-04 | Must | TV3, TV6 | Review — cần một run CD thật của tag mới | `.github/workflows/cd.yml`, [deployment.md](../deployment.md) |
| PB-23 | Là giảng viên, tôi muốn truy cập bản production qua HTTPS | Task 5.4, NFR-04 | Must | TV3 | Done | https://brewlite-swe-project-web.vercel.app |
| PB-24 | Là nhóm, tôi cần release notes, video demo, Sprint Review và Retrospective | Task 5.4 | Must | TV6, cả nhóm | In progress — Retro chờ nhóm chốt hành động | [release-notes.md](../release-notes.md), [demo](demo-evidence.md), [sprint-review.md](sprint-review.md), [sprint-retrospective.md](sprint-retrospective.md) |
| PB-25 | Sửa tràn ngang trang chi tiết món ở màn hình 375 px | NFR-03 | Should | TV4 | To do | [qa-report](../testing/qa-report-2026-11-15.md), `docs/testing/evidence/product-375-finding.png` |

## Ngoài phạm vi / Won't (MVP)

| ID | Mục | Lý do |
|---|---|---|
| PB-W1 | Áp dụng mã khuyến mãi (Promotion) | Phạm vi mở rộng; đã có trong class diagram, chưa có bảng DB |
| PB-W2 | Tích điểm thành viên (LoyaltyTransaction) | Ngoài phạm vi theo context-and-scope |
| PB-W3 | Giao hàng tận nơi | Won't theo SRS |
| PB-W4 | Thanh toán thật MoMo/VNPay | Won't theo SRS, dùng cổng mô phỏng (ADR 004) |
