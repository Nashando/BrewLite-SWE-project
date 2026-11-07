# Build context: apps/api  (xem docker-compose.yml ở thư mục gốc)
# Cần có package-lock.json trong apps/api (chạy `npm install` một lần rồi commit).

# ---- 1) Cài dependency production + sinh Prisma Client ----
FROM node:22-alpine AS deps
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate

# ---- 2) Build TypeScript ----
FROM node:22-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- 3) Image chạy thật ----
FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY prisma ./prisma
EXPOSE 3001
# Chạy migration rồi mới khởi động API (đúng ADR 002)
CMD ["npm", "run", "start:migrate"]
