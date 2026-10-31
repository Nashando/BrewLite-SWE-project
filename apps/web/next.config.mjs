/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tạo bản build tối giản (.next/standalone) để Docker image nhỏ gọn
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
