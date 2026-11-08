# BrewLite-SWE-project

## 1. Cấu trúc dự án (Monorepo)
- `apps/web`: Frontend ứng dụng
- `apps/api`: Backend API & Database Schema
- `docs/`: Tài liệu thiết kế hệ thống, SRS, sơ đồ kiến trúc
- `tests/`: Integration test và end-to-end test

---

## 2. Chạy ở local

Chỉ cần cài **Docker** (Windows và Mac dùng Docker Desktop, mở lên trước khi chạy). Không cần Node.js hay PostgreSQL. Các cổng 3000, 3001 và 5432 phải đang trống.

```bash
git clone https://github.com/Nashando/BrewLite-SWE-project.git
cd BrewLite-SWE-project

# 1. Bật web, API và database; API tự chạy migration khi khởi động
docker compose up --build -d

# 2. Nạp dữ liệu mẫu; chạy lại không mất dữ liệu đang có
docker compose exec api npm run seed
```

Các lệnh giống nhau trên Windows, Mac và Linux. Lần chạy đầu cần Internet để tải image.

| Địa chỉ | Dùng để |
|---|---|
| http://localhost:3000 | Web |
| http://localhost:3001/health | Kiểm tra API và database |

Tài khoản mẫu, chỉ dùng ở local:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Khách hàng | `khach@brewlite.vn` | `Customer@123` |
| Nhân viên | `staff@brewlite.vn` | `Staff@123` |
| Quản lý | `manager@brewlite.vn` | `Manager@123` |

Thanh toán chỉ là mô phỏng: tài khoản mới có sẵn 200.000 ₫ trong ví; thẻ `4242 4242 4242 4242` thành công, thẻ `4000 0000 0000 1234` bị từ chối.

```bash
docker compose logs -f api   # xem log API
docker compose down          # tắt, giữ dữ liệu
docker compose down -v       # tắt và xoá sạch dữ liệu
```

Muốn đổi cấu hình thì sao chép `.env.example` thành `.env` ở thư mục gốc. Chi tiết API xem [`apps/api/README.md`](apps/api/README.md).

### Kiểm thử

```bash
# Unit test: không cần bật hệ thống
(cd apps/api && npm ci && npm run lint && npm test && npm run build)
(cd apps/web && npm ci && npm run lint && npm test && npm run build)
```

Integration và end-to-end test cần hệ thống đang chạy, xem [`tests/README.md`](tests/README.md).

---

## 3. Quy ước viết Commit Message
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

## 4. Definition of Done (DoD) - Tiêu chí hoàn thành Task
Một Task/Issue chỉ được kéo sang cột **Done** trên Issue Board khi thỏa mãn đủ các tiêu chí:
1. **Code chất lượng:** Code chạy tốt ở môi trường Local, không bị lỗi cú pháp/lint.
2. **Kiểm thử:** Đã tự chạy kiểm thử (Unit test/Integration test) thành công cho chức năng mới.
3. **Quy trình Git:** Code được push lên nhánh riêng và tạo Pull Request (PR) hướng vào nhánh chính (`main`/`develop`).
4. **Code Review:** Được ít nhất 1 thành viên khác trong nhóm review và Approve PR trước khi Merge.
5. **Cập nhật tài liệu:** Cập nhật file tài liệu liên quan trong thư mục `docs/` (nếu có thay đổi kiến trúc/API).
