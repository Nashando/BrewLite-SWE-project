import { expect, test } from '@playwright/test';
import {
  call,
  createProduct,
  hideProduct,
  loginManager,
  registerCustomer,
  unique,
} from '../helpers/api.mjs';
import { addToCart, confirmPayment, fillCard, gateway, goToCheckout, logIn, placeOrderButton } from './helpers.mjs';

let manager;
let product;

test.beforeAll(async () => {
  manager = await loginManager();
});

test.beforeEach(async () => {
  product = await createProduct(manager, { name: unique('E2E Latte'), basePrice: 40000, stock: 20 });
});

test.afterEach(() => hideProduct(manager, product.id));

test('E2E-T01: từ menu đến xác nhận đơn bằng ví, gồm bước chưa đăng nhập', async ({ page }) => {
  const user = await registerCustomer();

  // Khách chưa đăng nhập chọn món: size L phụ thu 5.000, số lượng 2
  await page.goto('/menu');
  await expect(page.getByRole('heading', { name: 'Hôm nay uống gì?' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Tìm món' }).fill(product.name);
  await page.getByRole('heading', { name: product.name }).click();
  await page.getByRole('radio', { name: /^L\b/ }).check();
  const panel = page.getByRole('region', { name: 'Số lượng và giá' });
  await panel.getByRole('button', { name: /Tăng số lượng/ }).click();
  await expect(panel.getByRole('button', { name: /Thêm vào giỏ/ })).toContainText('90.000');
  await panel.getByRole('button', { name: /Thêm vào giỏ/ }).click();

  // Giỏ hàng tính đúng tổng và còn sau khi tải lại trang
  await page.goto('/cart');
  await page.reload();
  await expect(page.getByRole('region', { name: 'Tổng cộng' })).toContainText('90.000');

  // Chưa đăng nhập thì bị chặn ở bước thanh toán, đăng nhập xong quay lại đúng trang
  await page.getByRole('link', { name: 'Thanh toán' }).click();
  await expect(page.getByText('Bạn cần đăng nhập')).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: 'Đăng nhập' }).click();
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Mật khẩu').fill(user.password);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  // Tạo đơn, cổng mô phỏng hiện số tiền và số dư, xác nhận thanh toán
  await expect(page.getByRole('radio', { name: 'Ví BrewLite' })).toBeChecked();
  await placeOrderButton(page).click();
  await expect(gateway(page)).toContainText('90.000');
  await expect(gateway(page)).toContainText('200.000');
  await confirmPayment(page).click();

  // Xác nhận đơn: có mã đơn, đã thanh toán, đúng món
  await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);
  const heading = page.getByRole('heading', { name: /^Đơn BL-/ });
  await expect(heading).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Đã thanh toán');
  await expect(page.getByRole('main')).toContainText('Ví BrewLite');
  await expect(page.getByRole('region', { name: 'Món đã đặt' })).toContainText(product.name);
  const code = (await heading.innerText()).replace('Đơn ', '');

  // Giỏ đã trống, đơn có trong lịch sử, số dư bị trừ
  await page.goto('/cart');
  await expect(page.getByRole('link', { name: 'Thanh toán' })).toHaveCount(0);
  await page.goto('/orders');
  await expect(page.getByRole('link', { name: new RegExp(code) })).toBeVisible();
  expect((await call('GET', '/auth/me', { token: user.token })).body.walletBalance).toBe(110000);
});

test('E2E-T02: thẻ bị từ chối báo lỗi, giữ giỏ, thử lại bằng thẻ khác thành công', async ({ page }) => {
  const user = await registerCustomer();
  await logIn(page, user.email, user.password);
  await addToCart(page, product.name, { size: 'S' });
  await goToCheckout(page);

  await page.getByRole('radio', { name: 'Thẻ ngân hàng' }).check();
  await placeOrderButton(page).click();

  // Validate ở frontend trước khi gửi
  await expect(gateway(page)).toBeVisible();
  await confirmPayment(page).click();
  await expect(page.getByText('Số thẻ gồm 16 chữ số')).toBeVisible();

  await fillCard(page, '4000 0000 0000 1234');
  await confirmPayment(page).click();
  const alert = page.getByRole('main').getByRole('alert').filter({ hasText: 'Thanh toán thất bại, vui lòng thử lại.' });
  await expect(alert).toContainText('Thẻ bị từ chối');
  await expect(page).toHaveURL(/\/checkout$/);

  await page.getByRole('button', { name: 'Thử thanh toán lại' }).click();
  await expect(gateway(page)).toBeVisible();
  await fillCard(page, '4242 4242 4242 4242');
  await confirmPayment(page).click();

  await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);
  await expect(page.getByRole('main')).toContainText('Đã thanh toán');
  await expect(page.getByRole('main')).toContainText('Thẻ ngân hàng');
});

test('E2E-T06: giỏ còn món cũ không có trên hệ thống: tự bỏ, báo khách, đặt được món còn lại', async ({ page }) => {
  const user = await registerCustomer();
  await logIn(page, user.email, user.password);
  await addToCart(page, product.name, { size: 'S' });

  // Giỏ trong localStorage còn món từ lần chạy mock, id không phải UUID
  await page.evaluate(() => {
    const stored = JSON.parse(localStorage.getItem('brewlite-cart'));
    stored.state.items.push({
      lineId: 'p-08|size-l|top-cream',
      productId: 'p-08',
      name: 'Matcha đá xay',
      category: 'Đá xay',
      imageUrl: null,
      sizeId: 'size-l',
      sizeName: 'Lớn',
      toppings: [{ id: 'top-cream', name: 'Kem whipping', price: 8000 }],
      unitPrice: 79000,
      quantity: 1,
    });
    localStorage.setItem('brewlite-cart', JSON.stringify(stored));
  });

  // Vào thẳng trang thanh toán: đúng trường hợp giỏ cũ từng gây lỗi "must be a UUID"
  await page.goto('/checkout');
  await expect(page.getByRole('main')).toContainText('Đã bỏ khỏi giỏ');
  await expect(page.getByRole('main')).toContainText('Matcha đá xay');
  await expect(page.getByRole('region', { name: 'Tóm tắt đơn hàng' })).not.toContainText('Matcha đá xay');

  await placeOrderButton(page).click();
  await confirmPayment(page).click();
  await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);
  await expect(page.getByRole('main')).toContainText('Đã thanh toán');
});

test('E2E-T06: quản lý đổi giá sau khi khách thêm vào giỏ: giỏ hiện giá mới, đúng số tiền bị trừ', async ({ page }) => {
  const user = await registerCustomer();
  await logIn(page, user.email, user.password);
  await addToCart(page, product.name, { size: 'S' });

  await call('PATCH', `/admin/products/${product.id}`, { token: manager, body: { basePrice: 50000 } });

  // Đi qua trang giỏ: giỏ đối chiếu ngay tại đây nên thông báo hiện ở trang giỏ
  await page.goto('/cart');
  await expect(page.getByRole('main')).toContainText('Giá một số món đã thay đổi');
  await page.getByRole('link', { name: 'Thanh toán' }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('region', { name: 'Tóm tắt đơn hàng' })).toContainText('50.000');
  await placeOrderButton(page).click();
  await expect(gateway(page)).toContainText('50.000');
});

test('E2E-T03: món vừa hết hàng khi đặt đơn thì báo lỗi và dẫn về giỏ', async ({ page }) => {
  const user = await registerCustomer();
  await logIn(page, user.email, user.password);
  await addToCart(page, product.name, { size: 'S' });

  // Khách khác vừa mua hết món này
  await call('POST', `/admin/products/${product.id}/stock`, { token: manager, body: { delta: -20 } });

  await goToCheckout(page);
  await placeOrderButton(page).click();

  await expect(page.getByRole('main').getByRole('alert')).toContainText('không đủ số lượng tồn kho');
  await expect(page.getByRole('link', { name: 'Quay lại giỏ hàng' })).toHaveAttribute('href', '/cart');
  await expect(page.getByRole('button', { name: 'Thử thanh toán lại' })).toBeDisabled();
});
