# Release notes — BrewLite

Ghi chú được cập nhật ngày **14/11/2026** theo main tại [f832448](https://github.com/Nashando/BrewLite-SWE-project/commit/f8324480454fb9e0f9dfbf8d2504a241c89428e3). Các mục có tag ghi đúng mốc Git tương ứng; phần **Chưa phát hành** không tự tạo một phiên bản semver hoặc GitHub Release mới.

## Chưa phát hành — mốc main f832448

- **Commit làm mốc:** `f8324480454fb9e0f9dfbf8d2504a241c89428e3`.
- **Ngày commit:** 14/11/2026.
- **Thay đổi mới nhất:** bốn commit cập nhật SRS, context/scope và ma trận truy vết; trước đó là [PR #27 — chỉnh sửa nhất quán các tài liệu](https://github.com/Nashando/BrewLite-SWE-project/pull/27).
- **Trạng thái:** main chưa có tag trỏ trực tiếp vào commit này tại lần kiểm tra ngày 14/11. Đây là ghi chú chuẩn bị bàn giao; chưa khẳng định production đang chạy đúng SHA này.

### Cập nhật yêu cầu và truy vết ngày 14/11

- `9475b9e`, `bcccd94`, `6a11834`, `f832448`: bổ sung FR-08–11 và MoSCoW trong SRS; làm rõ phạm vi MVP, mở rộng và ngoài phạm vi.
- Ma trận sửa API tạo đơn thành `POST /orders`, thêm `PATCH /orders/:id/status`, các dòng FR-08–11 và NFR-05. Link sơ đồ trong SRS chuyển sang bộ `docs/diagrams` trên main.
- Các commit này chỉ sửa tài liệu. Mã FR-08/09/10 giữa SRS và sơ đồ, một số đường dẫn code/test và truy vết NFR-01–04 vẫn cần đồng bộ; không ghi nhận bộ tài liệu đã được nghiệm thu hoàn chỉnh.

### Tài liệu và kiến trúc từ PR #27

- Cập nhật README và hướng dẫn triển khai/rollback theo mô hình Vercel Git Integration và Render deploy từ Git qua Deploy Hook.
- Thêm [ADR 007 về chiến lược CI/CD](architecture/adr/007-cicd-and-deployment-strategy.md).
- Chỉnh [tài liệu kiến trúc](architecture/Architecture%20Document.md): thống nhất size S/M/L, thanh toán mô phỏng nội bộ và mô tả các thành phần.
- Cập nhật [deployment diagram](diagrams/deployment-diagram.svg) và [nguồn PlantUML](diagrams/deployment-diagram.puml).
- PR #27 chỉ sửa tài liệu/sơ đồ; không đổi code ứng dụng, bộ test, migration hoặc workflow so với main `72eec2b`.

### Thay đổi tích lũy sau tag v1.0.1

- Bổ sung bố cục tablet/máy tính cho menu, chi tiết món, giỏ hàng, checkout, màn hình quầy và quản lý; điều chỉnh lưới card, độ cao hàng và vị trí giá.
- Seed thêm 11 món, tổng **21 món** trên database mới; giữ 3 tài khoản demo và 4 topping. Số món seed không chứng minh database production đã được nạp cùng dữ liệu.
- Playwright thêm project `desktop-chromium` bên cạnh `mobile-chromium`: 10 kịch bản chạy ở hai cấu hình, tổng 20 lượt.
- Các thay đổi layout, seed và E2E desktop thuộc main sau v1.0.1, không gán ngược về tag đó.

### Chức năng hiện có trong bản bàn giao

- **Khách hàng:** xem menu/tìm món/lọc danh mục, xem chi tiết, chọn size/topping và quản lý giỏ. Giỏ lưu trong trình duyệt, được đối chiếu lại với menu để loại món không còn bán hoặc cập nhật giá.
- **Tài khoản:** đăng ký/đăng nhập, JWT và phân quyền CUSTOMER/STAFF/MANAGER. Chỉ CUSTOMER được tạo đơn và thanh toán.
- **Đặt đơn:** `POST /orders`; server tính lại giá, kiểm tra tùy chọn và cập nhật tồn kho có điều kiện trong transaction. Lịch sử đơn dùng `GET /orders`.
- **Ví/Thẻ mô phỏng:** gửi `Idempotency-Key` để trả lại kết quả cũ khi gửi trùng, tránh thu tiền lặp. Thất bại nghiệp vụ `402` hủy đơn, hoàn kho, ghi giao dịch FAILED và giữ giỏ; lần thử sau tạo đơn mới. Lỗi validate `400` có thể giữ đơn chờ; lỗi mạng/5xx cần xác minh kết quả với cùng đơn/khóa.
- **Tiền mặt:** đơn chờ thanh toán và giao dịch PENDING; STAFF/MANAGER xác nhận đã thu tiền qua `POST /orders/:id/confirm-cash` mới chuyển đơn PAID.
- **Màn hình quầy:** đã có UI `/staff`, xem toàn bộ đơn qua `GET /orders/all`, chuyển trạng thái bằng `PATCH /orders/:id/status`: PAID → PREPARING → READY → COMPLETED. Quầy tự làm mới theo chu kỳ 15 giây.
- **Theo dõi/hủy đơn:** khách xem lịch sử và chi tiết; hủy khi chưa pha chế. Hệ thống hoàn kho, hoàn số dư ví nếu đã thu bằng ví và cập nhật trạng thái hoàn tiền mô phỏng cho giao dịch liên quan.
- **Quản lý:** MANAGER có UI `/admin/products`, `/admin/toppings`, `/admin/revenue` cho món/size/topping, tồn kho và doanh thu.
- **Vận hành:** PostgreSQL/Prisma, 4 migration, seed, log và `GET /health` kiểm tra API cùng kết nối database.

### CI/CD và phiên bản triển khai

Workflow thực thi tại commit này:

```text
Push tag vX.Y.Z
  → quality: gọi lại CI để lint/test/typecheck/build API và web
  → deploy-api: gọi Render Deploy Hook với ref=GITHUB_SHA
  → smoke-test: kiểm tra API /health, /products và web /menu
```

- Vercel triển khai web độc lập qua Git Integration; job CD không upload bundle web lên Vercel.
- Workflow hiện không có job build/push GHCR và không có rollback tự động. Các đoạn chú thích/mô tả GHCR còn trong YAML/ADR không được coi là minh chứng rằng job đó đã chạy.
- CD thành công gần nhất đã xác minh là [run 43180620060](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/43180620060), tag v1.0.1 tại `2a544e7`; không dùng run này để khẳng định đã triển khai mốc main f832448.
- HTTP smoke thành công không tự xác nhận SHA đang phục vụ hoặc luồng giao dịch production đã được nghiệm thu.

### Minh chứng kiểm thử và demo

| Phạm vi | Kết quả và phiên bản |
|---|---|
| CI của PR #27 | [Run 43464677033](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/43464677033), PR head `bf10fc2`: lint/build API và web, web typecheck đều đạt; 56 test Jest API và 163 frontend đạt. Main sau squash là ba3b7f6, không phải SHA của run này. |
| Phạm vi Jest API | 56 test gồm 4 HTTP test products dùng database mock; không thay thế integration PostgreSQL thật. |
| Integration PostgreSQL thật | Chạy local ngày 13/11 trên 72eec2b: **38/38 đạt**. |
| E2E Chromium | Cùng lượt local: **10/10 mobile + 10/10 desktop**, không retry, không skipped/flaky. |
| Quan hệ với main mới | Code ứng dụng/test/migration/workflow không đổi giữa 72eec2b và f832448; giữ nguyên phạm vi kết quả đã chạy, không ghi thành một lượt test mới trên f832448. |
| Demo bản ba3b7f6 | Ghi ngày 14/11: Ví đi hết luồng đến Hoàn tất; thẻ bị từ chối rồi thử lại bằng đơn mới thành công; tiền mặt được quầy xác nhận. Video có SHA/ngày quay, dài 03:56, Full HD. |

Lượt integration/E2E và demo dùng Windows, Node.js 26.10.0, PostgreSQL 16.15, API đã build và Next.js dev với API thật. CI dùng Node.js 22. Đây là minh chứng local; chưa xác nhận riêng full stack Docker Compose hoặc giao dịch trên production. Video được nộp kèm hồ sơ dưới tên `BrewLite_demo_ban_cuoi_ba3b7f6_2026-11-14.mp4`; không coi video là footage cuộc họp Sprint Review.

### Nâng cấp, migration và rollback

1. Chọn đúng SHA/tag bàn giao và đối chiếu phiên bản web/API. Không ghi đè tag v1.0.0 hoặc v1.0.1 đã tồn tại.
2. Mốc main f832448 không thêm/sửa Prisma schema hoặc migration so với v1.0.1; bộ source vẫn có 4 migration. API dùng `npm run start:migrate` để áp dụng migration trước khi mở server.
3. Production không tự seed. Khi có chủ đích nạp dữ liệu demo sau build, dùng `npm run seed` chạy `dist/seed/seed.js`. Seed cập nhật giá topping và giá/mô tả/danh mục món trùng tên; không dùng seed để rollback dữ liệu.
4. Rollback API/web bằng deployment ổn định hoặc redeploy đúng commit đã xác nhận. Rollback ứng dụng không tự hoàn tác schema, đơn hàng, tồn kho hoặc số dư ví; kiểm tra tương thích và backup trước khi khôi phục.
5. Xem [hướng dẫn triển khai và rollback, mục 5](deployment.md) và xác minh log/SHA trên Dashboard. Chưa có diễn tập rollback production được ghi nhận trong lượt cập nhật này.

### Hạn chế đã biết

- Ví/Thẻ/tiền mặt là mô phỏng, không kết nối ngân hàng thật. Promotion/Loyalty, giao hàng và WebSocket chưa hiện thực.
- Đơn chưa trả tiền giữ hàng mặc định 15 phút; việc đánh dấu hủy/hoàn kho xảy ra khi request liên quan kích hoạt kiểm tra quá hạn, không có cron/timer nền hủy đúng phút thứ 15.
- Backend có refresh endpoint, nhưng frontend hiện chỉ lưu access token và đăng xuất khi nhận 401; chưa tự refresh.
- Giỏ hàng lưu trong trình duyệt; không coi việc có Cart API là bằng chứng giỏ UI đã được đồng bộ giữa thiết bị.
- Cấu hình Render/Vercel thực tế, SHA production, quyền truy cập ngoài của DB, backup và trạng thái enforce CI phải được xác minh riêng khi nghiệm thu. Việc có tài liệu hoặc run thành công không tự chứng minh các phần này đã đủ.

## v1.0.1 — tag tại 2a544e7

- Commit: `2a544e7e946bc75f171c9873afd24152954ca685`, ngày 12/11/2026.
- Đổi CD sang yêu cầu Render deploy theo Git SHA qua Deploy Hook; các job là quality → deploy-api → smoke-test.
- [CD run 43180620060](https://github.com/Nashando/BrewLite-SWE-project/actions/runs/43180620060) thành công, gồm smoke health/products/web menu.
- Cấu hình Playwright trong tag này chỉ có mobile-chromium. Phần desktop và seed thêm món ở main sau tag được ghi trong mục Chưa phát hành.
- Tại lần kiểm tra GitHub ngày 14/11 có tag v1.0.1, chưa thấy GitHub Release cho tag này; ghi chú này không công bố Release mới.

## v1.0.0 — 07/11/2026

- Mốc lịch sử: commit `25f710da802f62d6f6c9e6e8054d97ddcba03e5f`.
- Có [GitHub Release v1.0.0](https://github.com/Nashando/BrewLite-SWE-project/releases/tag/v1.0.0).
- Dùng source ở tag này để đối chiếu phiên bản cũ; không gán tính năng, kết quả test hoặc cơ chế CD của main mới ngược về v1.0.0.

---

Ghi chú mô tả source tại mốc f832448 và giữ nguyên SHA gốc của từng minh chứng kiểm thử/demo. Phần Chưa phát hành không phải là công bố một tag hoặc GitHub Release mới.
