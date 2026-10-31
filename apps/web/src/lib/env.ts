// Phải truy cập trực tiếp process.env.NEXT_PUBLIC_* để Next nhúng giá trị vào bundle.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(
  /\/+$/,
  '',
);

export const API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';
