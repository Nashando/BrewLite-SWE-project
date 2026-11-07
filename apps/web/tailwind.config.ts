import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pine: '#17443A', // màu thương hiệu: header, nút chính
        mist: '#EDF3F0', // nền trang
        ink: '#12211D', // chữ
        crema: '#F1C45B', // lớp crema: điểm sáng
        line: '#CBD9D3', // đường kẻ, viền
        danger: '#B42318', // lỗi, hết hàng
        chart: '#0E8A6B', // cột biểu đồ, đã kiểm tra độ tương phản trên nền mist
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
