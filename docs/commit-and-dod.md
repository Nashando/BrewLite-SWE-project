# Quy chuẩn Commit & Definition of Done (DoD) - Dự án BrewLite

Tài liệu này thống nhất cách ghi commit và những việc cơ bản cần kiểm tra trước khi xem một task là hoàn thành. Quy trình được giữ ở mức phù hợp với đồ án và công cụ hiện có của nhóm.

---

## 1. Quy chuẩn Commit

Viết commit ngắn gọn, nêu rõ nội dung thay đổi. Nhóm có thể dùng định dạng:

```text
<type>: <mô tả ngắn>
```

Các `type` thường dùng:

- **`feat`**: Thêm chức năng mới. Ví dụ: `feat: thêm API danh sách sản phẩm`
- **`fix`**: Sửa lỗi. Ví dụ: `fix: sửa lỗi tính tổng tiền giỏ hàng`
- **`docs`**: Thêm hoặc cập nhật tài liệu. Ví dụ: `docs: cập nhật hướng dẫn cài đặt`
- **`test`**: Thêm hoặc cập nhật kiểm thử.
- **`chore`**: Thay đổi cấu hình hoặc công việc bảo trì. Ví dụ: `chore: cập nhật cấu hình dự án`

Có thể thêm phạm vi trong ngoặc khi thấy hữu ích, chẳng hạn `feat(api): thêm API danh sách sản phẩm`. Không bắt buộc phải dùng scope cho mọi commit.

---

## 2. Quy trình làm việc với nhánh

- Tạo nhánh riêng cho công việc cần làm, ví dụ `feature/product-list` hoặc `TVx`(x = 1, 2, 3,...).
- Khi nhóm sử dụng Pull Request (PR), mô tả ngắn gọn thay đổi và nhờ ít nhất một thành viên xem qua trước khi gộp vào nhánh chính.
- Hạn chế đẩy trực tiếp lên nhánh chính để tránh ghi đè hoặc làm ảnh hưởng công việc chung.

---

## 3. Tiêu chí hoàn thành (Definition of Done - DoD)

Một task hoặc Pull Request (PR) được xem là hoàn thành khi đáp ứng đầy đủ các tiêu chí bắt buộc sau:

1. **Thực thi & Kiểm thử cục bộ**: Phần việc đã được thực hiện, chạy thử thành công trong phạm vi liên quan và không phát sinh lỗi hồi quy (regression).
2. **Quy chuẩn CI bắt buộc (Mandatory CI)**: 
   - **Tuyệt đối KHÔNG được merge PR nếu CI thất bại (CI fail)**.
   - Bắt buộc toàn bộ các bước trong GitHub Actions workflow (`.github/workflows/ci.yml`) phải báo xanh (Pass 100%):
     - `[api]`: Install dependencies -> Generate Prisma Client -> Lint -> Unit test -> Build.
     - `[web]`: Install dependencies -> Lint -> Typecheck -> Unit test (Vitest) -> Build.
3. **Bảo mật & Secrets**: Tuyệt đối không đưa mật khẩu, token, connection string hoặc thông tin bí mật vào kho mã nguồn (luôn dùng `.env` và template `.env.example`).
4. **Đồng bộ Cấu hình & Tài liệu**: Cập nhật `.env.example` nếu có thêm/sửa biến môi trường; cập nhật tài liệu kiến trúc/hướng dẫn sử dụng nếu thay đổi ảnh hưởng đến hệ thống.
5. **Code Review & Phê duyệt (Approval)**: PR bắt buộc phải có ít nhất một thành viên khác xem xét (review) và phê duyệt (Approve) trước khi gộp vào nhánh chính (`main`).
