# ADR 007: Lựa chọn Chiến lược CI/CD và Triển khai Production (Hướng A)

## Trạng thái
- **Đã duyệt và áp dụng** (Accepted)

## Bối cảnh & Vấn đề
Hệ thống **BrewLite** cần một quy trình phát hành (Release & Deployment Pipeline) tự động hóa cao từ mã nguồn đến môi trường production nhằm đảm bảo:
1. Chất lượng mã nguồn được kiểm soát chặt chẽ qua CI (Lint, Test, Build).
2. Môi trường Production vận hành ổn định, không bị gián đoạn hay thay đổi URL đột ngột.
3. Tối ưu hóa chi phí và tài nguyên hạ tầng cho đồ án tốt nghiệp.

## Các phương án đã cân nhắc
- **Hướng B (Existing Image):** Build Docker image của Backend trong GitHub Actions, push lên GHCR và dùng image đó trực tiếp trên Render. 
  - *Nhược điểm:* Phát sinh độ trễ kéo image lớn trên Render Free Tier, dễ gặp lỗi cấu hình network/port rườm rà và tốn thời gian cấu hình token xác thực.
- **Hướng A (Node Runtime qua Deploy Hook - Đã chọn):** CI/CD thực hiện kiểm thử, đóng gói image lên GHCR làm minh chứng kỹ thuật, sau đó kích hoạt Render Deploy Hook để Render tự động build ứng dụng Node trực tiếp từ mã nguồn sạch trên nhánh `main`.

## Quyết định
Chúng ta chọn **Hướng A**:
- **Frontend (Vercel):** Liên kết trực tiếp qua Git Integration với nhánh `main` để tự động build và phân phối qua Edge CDN.
- **Backend (Render Web Service):** Sử dụng Node runtime build trực tiếp từ Git, kích hoạt tự động thông qua **Render Deploy Hook** sau khi CI/CD qua vòng kiểm duyệt (Quality Gate).
- **Minh chứng kỹ thuật (GHCR):** GitHub Actions vẫn thực hiện build Docker image và đẩy lên GitHub Container Registry (GHCR) như một artifact minh chứng cho năng lực tự động hóa của nhóm.

## Hệ quả & Đánh giá
- **Ưu điểm:** Loại bỏ rủi ro lệch cấu hình container trên Render, deployment mượt mà, giữ nguyên cấu trúc URL ổn định và tận dụng tối đa cơ chế tự động migration của Prisma.
- **Nhược điểm:** Phụ thuộc vào tốc độ build trực tiếp trên Render (đã được khắc phục bằng cách tối ưu hóa file `package.json` và caching).