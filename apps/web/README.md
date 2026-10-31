# BrewLite – apps/web

Next.js (App Router) + TypeScript + Tailwind, mobile-first/PWA.

## Chạy local

```bash
cp .env.example .env.local
npm install
npm run mocks:init   # một lần: sinh public/mockServiceWorker.js (MSW)
npm run dev          # http://localhost:3000
```

- `NEXT_PUBLIC_API_MOCKING=enabled`: dùng dữ liệu giả, không cần backend.
- Khi backend sẵn sàng: đặt `NEXT_PUBLIC_API_MOCKING=disabled` và `NEXT_PUBLIC_API_URL` trỏ tới NestJS.

## Lệnh thường dùng (khớp pipeline CI: Install → Lint → Test → Build)

| Lệnh | Mục đích |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | Kiểm tra kiểu TypeScript |
| `npm test` | Vitest (chạy một lần) |
| `npm run build` | Build production (standalone) |

## Docker

```bash
docker build -t brewlite-web \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 .
docker run -p 3000:3000 brewlite-web
```

`NEXT_PUBLIC_API_URL` được nhúng lúc build và là URL mà **trình duyệt** gọi tới.

## Cấu trúc

```
src/app/                 route mỏng (layout, menu, ...)
src/features/<tên>/      components, hooks, api, __tests__ theo từng tính năng
src/components/          UI dùng chung
src/lib/                 apiClient, errors, format, env
src/mocks/               MSW (dev + test)
```
