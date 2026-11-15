# Minh chứng Docker Compose — GitHub Codespaces, 15/11/2026

Lượt này thay cho trạng thái BLOCKED trong [compose-result.json](../compose-result.json): máy QA không có Docker nên Compose được chạy trên GitHub Codespaces (Linux, Docker Engine + Compose v2), từ source `main` có code ứng dụng như `9808d37` (commit `fe94ad7` sau đó chỉ đổi tài liệu). Code ứng dụng, migration, test và `docker-compose.yml` không sửa.

## Các bước đã chạy

```bash
export NEXT_PUBLIC_API_URL="https://${CODESPACE_NAME}-3001.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
docker compose up --build -d
docker compose exec api npm run seed
CORS_ORIGIN="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN},http://localhost:3000" \
  docker compose up -d --force-recreate --wait api
cd tests && npm ci && npx playwright install --with-deps chromium && npm test
```

`NEXT_PUBLIC_API_URL` và `CORS_ORIGIN` chỉ cần truyền vì trình duyệt truy cập qua URL forward của Codespaces. Trên máy local, giá trị mặc định trong `docker-compose.yml` là đủ.

## Kết quả

| Hạng mục | Kết quả | File |
|---|---|---|
| Container | `db`, `api`, `web` đều `Up (healthy)`; cổng chỉ bind `127.0.0.1` | [compose-ps.txt](compose-ps.txt) |
| Migration + seed | API chạy `prisma migrate deploy` khi khởi động; seed: 3 user, 4 topping, 21 sản phẩm | [compose-logs.txt](compose-logs.txt) |
| Health | `GET /health` → `status: ok`, `database: up` | [health.json](health.json) |
| Unit QA | 8/8 pass | [test-run.txt](test-run.txt) |
| Integration (PostgreSQL trong Compose) | 38/38 pass (INT-T01…T05) | [test-run.txt](test-run.txt) |
| E2E Playwright | 20/20 pass: 10 kịch bản × `mobile-chromium` 375×812 và `desktop-chromium` 1440×900 | [test-run.txt](test-run.txt) |

## Giới hạn

- Đây là môi trường cloud dev của Codespaces, không phải production.
- Lượt này không đo lại layout 375 px; finding tràn ngang trang chi tiết vẫn mở theo [QA report](../../qa-report-2026-11-15.md).
- Không dùng script `tests/scripts/verify-compose.ps1` vì Codespaces không có PowerShell; các bước tương đương được chạy tay như trên.
