import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  // Các spec không dùng chung dữ liệu nhưng cùng chạy trên một hệ thống; chạy lần lượt để kết quả ổn định
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.WEB_URL ?? 'http://localhost:3000',
    // Ứng dụng theo hướng mobile-first nên test ở cỡ màn hình điện thoại
    ...devices['Pixel 7'],
    locale: 'vi-VN',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'mobile-chromium' }],
});
