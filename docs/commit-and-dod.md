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

Một task được xem là hoàn thành khi:

1. Phần việc đã được thực hiện và chạy thử trong phạm vi liên quan.
2. Các kiểm thử hiện có liên quan đã chạy thành công. Nếu chưa có kiểm thử phù hợp, người thực hiện kiểm tra thủ công các luồng chính.
3. Không đưa mật khẩu, token hoặc thông tin kết nối bí mật thật vào repository.
4. Cập nhật `.env.example` nếu có thêm biến môi trường; cập nhật tài liệu nếu thay đổi ảnh hưởng đến cách cài đặt hoặc sử dụng.
5. Nếu làm việc qua PR, thay đổi đã được thành viên khác xem qua và nhóm thống nhất trước khi gộp.

Các bước lint, test, build hoặc CI được thực hiện khi dự án đã có cấu hình tương ứng; không yêu cầu nhóm tạo thêm quy trình nếu hiện tại chưa sử dụng.
