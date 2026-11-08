# BrewLite - Hướng dẫn local, test, build, deploy và rollback

Tạo phẩm TV6, mục 42 - Task 5.4. Tài liệu dùng hợp đồng API Ví/Thẻ của nhánh `TV4-web-api-integration-v2`, baseline `2806727`. Các lệnh chạy tại thư mục gốc ứng dụng có `apps/api`, `apps/web` và `tests`, không chạy tại thư mục snapshot `TV6-QA/Task 5.4`.

Tại thời điểm soạn, main chưa tích hợp đầy đủ source ứng dụng. Có thể chọn nhánh `TV4-web-api-integration-v2` trên GitHub rồi Code > Download ZIP và giải nén, hoặc clone bằng Git nếu máy đã cài Git. Kiểm tra lại nhánh tích hợp của nhóm trước khi bàn giao chính thức.

## 1. Điều kiện và cấu hình

- Node.js 22, npm.
- PostgreSQL đang chạy, đã tạo database local; hoặc Docker Desktop với Linux containers nếu chọn Docker.
- Cổng web 3000, API 3001 và DB 5432 phải trống cho cấu hình mặc định.
- Các ví dụ bên dưới dùng PowerShell. Thay thông tin DB theo máy của bạn; không commit `.env` thực tế.

Trong thư mục gốc ứng dụng:

```powershell
Copy-Item .env.example .env
```

Nếu đã có `.env`, giữ cấu hình đang dùng thay vì ghi đè. Cấu hình local tối thiểu:

```dotenv
DATABASE_URL=postgresql://brewlite:brewlite@localhost:5432/brewlite
POSTGRES_USER=brewlite
POSTGRES_PASSWORD=brewlite
POSTGRES_DB=brewlite
PORT=3001
JWT_SECRET=change-me-in-local-only
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:3000
API_PREFIX=
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_MOCKING=disabled
```

Các giá trị trên chỉ là mẫu local. Backend dùng `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN` và `API_PREFIX`. Nếu đặt prefix `/api/v1` thì URL frontend phải là `http://localhost:3001/api/v1`; health luôn ở `/health`.

Tạo `apps/web/.env.local` để Next.js đọc cấu hình trực tiếp:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_MOCKING=disabled
```

`NEXT_PUBLIC_API_URL` được nhúng khi build frontend; thay URL sau khi build cần build lại.

## 2. Chạy local bằng Node.js

Chuẩn bị PostgreSQL và tạo database tương ứng với `DATABASE_URL` trước. Trong cửa sổ PowerShell thứ nhất, từ thư mục gốc:

```powershell
cd apps/api
npm.cmd ci
npm.cmd run prisma:generate
npm.cmd run prisma:deploy
npm.cmd run prisma:seed
npm.cmd run start:dev
```

Prisma CLI cần đọc được `DATABASE_URL`. Nếu cấu hình gốc không được nhận, đặt rõ trong cửa sổ đang chạy:

```powershell
$env:DATABASE_URL='postgresql://brewlite:brewlite@localhost:5432/brewlite'
```

Chạy lệnh trên trước migration/seed, đổi URL theo DB thật trên máy. `prisma:deploy` áp dụng các migration đã có; không cần tạo một migration init mới khi clone dự án.

Trong cửa sổ thứ hai, từ thư mục gốc:

```powershell
cd apps/web
npm.cmd ci
npm.cmd run dev
```

Truy cập:

| Thành phần | Địa chỉ mặc định |
|---|---|
| Web | http://localhost:3000/menu |
| API products | http://localhost:3001/products |
| Health | http://localhost:3001/health |

Tắt các process foreground bằng Ctrl+C tại đúng cửa sổ đã khởi động.

## 3. Chạy local bằng Docker Compose

Mở Docker Desktop và chờ engine sẵn sàng. Từ thư mục gốc:

```powershell
docker compose up --build -d
docker compose ps
docker compose logs api
```

Compose chạy web, API và PostgreSQL; API container chạy migration trước khi khởi động. Cấu hình Compose hiện tại không truyền `API_PREFIX` vào API container, nên dùng URL không prefix như ví dụ local ở trên. Không tự thêm `/api/v1` vào frontend nếu chưa đồng bộ cấu hình API container.

Nạp dữ liệu mẫu từ máy host:

```powershell
cd apps/api
npm.cmd ci
npm.cmd run prisma:generate
$env:DATABASE_URL='postgresql://brewlite:brewlite@localhost:5432/brewlite'
npm.cmd run prisma:seed
```

URL seed này kết nối DB qua cổng host. Trong container, Compose dùng hostname service `db`. Chạy lại seed không đặt lại tồn kho của sản phẩm đã tồn tại. Tài khoản demo chỉ dùng local/test:

| Vai trò | Email | Mật khẩu demo |
|---|---|---|
| Khách | khach@brewlite.vn | Customer@123 |
| Nhân viên | staff@brewlite.vn | Staff@123 |
| Quản lý | manager@brewlite.vn | Manager@123 |

Ví tài khoản mới mặc định 200.000đ. Thanh toán Ví/Thẻ đều mô phỏng, không trừ tiền thật. Thẻ demo `4242 4242 4242 4242` thành công, `4000 0000 0000 1234` bị từ chối; nhập hạn còn hiệu lực và CVV theo validate UI.

Từ gốc repo, `docker compose down` dừng stack và giữ volume dữ liệu. Không thêm `-v` nếu muốn giữ DB. Nếu PowerShell báo không nhận lệnh docker, máy chưa cài Docker hoặc PATH chưa nhận; chọn cách Node.js/PostgreSQL ở phần 2.

## 4. Chạy test

### 4.1. Unit test backend

Từ gốc repo:

```powershell
cd apps/api
npm.cmd ci
npm.cmd run prisma:generate
npm.cmd test -- --runInBand --testPathPattern=src
```

Chỉ chạy ba bộ nghiệp vụ để quay demo:

```powershell
npm.cmd test -- --runInBand --runTestsByPath src/common/pricing.spec.ts src/order/order.service.spec.ts src/payment/payment.service.spec.ts
```

Ba bộ này dùng mock, không cần API server hoặc PostgreSQL đang chạy. Lượt kiểm chứng ngày 07/11/2026 trên baseline 2806727 đạt 26/26; sau khi đổi code phải đọc kết quả mới.

`npm.cmd test -- --runInBand` chạy thêm HTTP products mock DB theo cấu hình Jest, vì vậy cần phân biệt với lệnh unit-only ở trên.

### 4.2. Unit/component test frontend

Từ gốc repo:

```powershell
cd apps/web
npm.cmd ci
npm.cmd test
```

Frontend dùng Vitest/Testing Library/MSW, không phải browser E2E. Trên Node 26, nếu jsdom lỗi localStorage, ưu tiên Node 22; hoặc đặt `$env:NODE_OPTIONS='--no-experimental-webstorage'` trong cửa sổ chạy test.

### 4.3. Integration và browser E2E

Dùng môi trường local/test riêng, API và DB đã migrate/seed, web đang chạy với mock API disabled. Không chạy bộ này trên production: test tạo tài khoản, món, đơn, và có ca chỉnh thời điểm đơn trong database.

Từ gốc repo:

```powershell
cd tests
npm.cmd ci
npx.cmd playwright install chromium
$env:API_URL='http://localhost:3001'
$env:WEB_URL='http://localhost:3000'
$env:DATABASE_URL='postgresql://brewlite:brewlite@localhost:5432/brewlite'
npm.cmd run test:integration
npm.cmd run test:e2e
```

Đổi các URL cho đúng môi trường test; API đang chạy và các ca SQL phải dùng cùng database. `npm.cmd test` trong tests chạy integration rồi E2E. Integration dùng node:test; browser E2E dùng Playwright. Khi lỗi, đọc assertion và report/trace; không bỏ test để làm kết quả xanh.

## 5. Lint và build

Backend, từ gốc repo:

```powershell
cd apps/api
npm.cmd run lint
npm.cmd run build
```

Frontend, từ gốc repo:

```powershell
cd apps/web
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

Backend build sinh Prisma Client rồi biên dịch NestJS. Frontend build tạo Next.js standalone; lúc build cần URL API đúng môi trường và có thể cần mạng để lấy Google Fonts. Nếu Prisma báo khóa query engine DLL trên Windows, dừng đúng API đang giữ client rồi generate/build lại.

Build hai Docker image để kiểm tra đóng gói, từ gốc repo:

```powershell
docker build -t brewlite-api:local apps/api
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 --build-arg NEXT_PUBLIC_API_MOCKING=disabled -t brewlite-web:local apps/web
```

## 6. Deploy

Phần này là quy trình bàn giao, cần TV3 chốt nhà cung cấp/registry/secrets/URL thật. Chưa xác nhận deploy production hoặc CD đã chạy thành công.

1. Chọn commit đã review và vượt qua lint/test/build. Ghi lại image/revision hiện hành để rollback.
2. Chuẩn bị PostgreSQL production private có persistent storage và backup. Không seed tài khoản demo lên production.
3. Cấu hình secret backend: `DATABASE_URL`, `JWT_SECRET`, các secret refresh nếu dùng; `PORT` theo host; `CORS_ORIGIN` bằng URL frontend HTTPS. Đồng bộ API_PREFIX với URL frontend.
4. Build image API và web bằng Dockerfile có sẵn. Gắn tag commit SHA/semver; frontend build với URL API HTTPS và mock API disabled. Push lên registry do nhóm chọn bằng credential/secret CI, không đưa credential vào Git/log.
5. Backup DB trước migration cần bảo vệ dữ liệu. Deploy API; container chạy `prisma migrate deploy` rồi start. Nếu migration lỗi, dừng release và điều tra, không tiếp tục web.
6. Kiểm tra health API đạt rồi deploy frontend. Bật HTTPS, kiểm tra CORS và truy cập thực tế từ trình duyệt.
7. Smoke test: GET /health trả 200/database up, GET /products trả 200, web mở menu được; đăng nhập/đặt đơn mô phỏng bằng tài khoản nghiệm thu.
8. Lưu URL frontend/API/health, commit/image tag, log pipeline và kết quả smoke. TV3 chốt release/tag/release notes theo phân công.

Ví dụ kiểm tra URL đã được TV3 cung cấp:

```powershell
$productionApi='https://THAY-BANG-API-HOST'
Invoke-RestMethod -Uri "$productionApi/health"
# Nếu API có prefix, thêm prefix vào URL products:
Invoke-RestMethod -Uri "$productionApi/products"
```

Thay hostname trước khi chạy. Không coi hostname minh họa là URL production thực tế.

## 7. Rollback

1. Khi deploy hoặc smoke test lỗi, dừng các bước phát hành tiếp theo; giữ log và ghi SHA/image của bản lỗi.
2. Dùng chức năng redeploy/revision rollback của nền tảng hoặc đổi cấu hình image về SHA/tag trước đã biết chạy tốt; triển khai lại API/web tương ứng.
3. Nếu frontend đổi URL API, dùng đúng bản build có URL phù hợp; sửa biến runtime không thay bundle đã build.
4. Rollback ứng dụng cần schema vẫn tương thích. Prisma không tự tạo down migration; ưu tiên migration mở rộng trước, chuyển code sau, xóa cột ở release khác.
5. Nếu schema không còn tương thích, người phụ trách DB đánh giá migration sửa tiến hoặc phục hồi backup đã kiểm chứng. Phục hồi có thể mất dữ liệu sau mốc backup; phải đánh giá trước khi thực hiện.
6. Chạy lại health, products và smoke luồng chính, kiểm tra log; ghi phiên bản đã phục hồi và kết quả. Chưa tick rollback đã kiểm chứng nếu mới có tài liệu.

## 8. Trạng thái nghiệm thu

README này đáp ứng cấu trúc hướng dẫn local/test/build/deploy/rollback. Các điều kiện cần xác nhận riêng trước nộp: Docker runtime, integration/E2E mới chạy đầy đủ, URL production hoạt động, CD/required checks và rollback thực tế. Video test và slide chưa đưa vào lần upload này theo yêu cầu.
