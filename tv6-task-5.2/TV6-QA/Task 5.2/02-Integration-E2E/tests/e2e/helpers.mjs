import { expect } from '@playwright/test';

/** Từ menu vào trang chi tiết, chọn size nếu có rồi thêm vào giỏ. */
export async function addToCart(page, name, { size } = {}) {
  await page.goto('/menu');
  await page.getByRole('searchbox', { name: 'Tìm món' }).fill(name);
  await page.getByRole('heading', { name }).click();
  await expect(page).toHaveURL(/\/products\//);
  if (size) await page.getByRole('radio', { name: new RegExp(`^${size}\\b`) }).check();
  await page
    .getByRole('region', { name: 'Số lượng và giá' })
    .getByRole('button', { name: /Thêm vào giỏ/ })
    .click();
}

export async function goToCheckout(page) {
  await page.goto('/cart');
  await page.getByRole('link', { name: 'Thanh toán' }).click();
  await expect(page).toHaveURL(/\/checkout$/);
}

export async function logIn(page, email, password, next = '/menu') {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(new RegExp(`${next}$`));
}

export const placeOrderButton = (page) => page.getByRole('button', { name: /^Xác nhận đặt hàng/ });
export const gateway = (page) => page.getByRole('region', { name: 'Cổng thanh toán mô phỏng' });
export const confirmPayment = (page) => page.getByRole('button', { name: 'Xác nhận thanh toán' });

export async function fillCard(page, number) {
  await page.getByLabel('Số thẻ').fill(number);
  await page.getByLabel('Hạn dùng (MM/YY)').fill('12/40');
  await page.getByLabel('CVV').fill('123');
}
