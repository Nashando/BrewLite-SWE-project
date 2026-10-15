# BrewLite-SWE-project

## 1. Cấu trúc dự án (Monorepo)
- `apps/web`: Frontend ứng dụng
- `apps/api`: Backend API & Database Schema
- `docs/`: Tài liệu thiết kế hệ thống, SRS, sơ đồ kiến trúc

---

## 2. Quy ước viết Commit Message
Cả nhóm thống nhất viết commit message theo cú pháp:
`<type>: <mô tả ngắn gọn bằng tiếng Việt>`

**Các `<type>` thường dùng:**
- `feat`: Thêm tính năng mới (ví dụ: `feat: thêm API đăng ký người dùng`)
- `fix`: Sửa lỗi (ví dụ: `fix: sửa lỗi không lưu được giỏ hàng`)
- `docs`: Thêm hoặc chỉnh sửa tài liệu (ví dụ: `docs: cập nhật sơ đồ Use-case`)
- `style`: Chỉnh sửa giao diện, CSS (không ảnh hưởng logic)
- `refactor`: Tối ưu hóa hoặc viết lại code nhưng giữ nguyên tính năng
- `chore`: Cập nhật cấu hình, cài gói phụ thuộc (ví dụ: `chore: cập nhật .gitignore`)

---

## 3. Definition of Done (DoD) - Tiêu chí hoàn thành Task
Một Task/Issue chỉ được kéo sang cột **Done** trên Issue Board khi thỏa mãn đủ các tiêu chí:
1. **Code chất lượng:** Code chạy tốt ở môi trường Local, không bị lỗi cú pháp/lint.
2. **Kiểm thử:** Đã tự chạy kiểm thử (Unit test/Integration test) thành công cho chức năng mới.
3. **Quy trình Git:** Code được push lên nhánh riêng và tạo Pull Request (PR) hướng vào nhánh chính (`main`/`develop`).
4. **Code Review:** Được ít nhất 1 thành viên khác trong nhóm review và Approve PR trước khi Merge.
5. **Cập nhật tài liệu:** Cập nhật file tài liệu liên quan trong thư mục `docs/` (nếu có thay đổi kiến trúc/API).
