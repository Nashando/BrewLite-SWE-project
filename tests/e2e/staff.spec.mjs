import { expect, test } from '@playwright/test';
import { createProduct, hideProduct, loginManager, registerCustomer, unique } from '../helpers/api.mjs';
import { addToCart, goToCheckout, logIn, placeOrderButton } from './helpers.mjs';

test('E2E-T04: trả tiền mặt, quầy xác nhận và xử lý đơn, khách thấy trạng thái mới', async ({ browser }) => {
  const manager = await loginManager();
  const product = await createProduct(manager, { name: unique('E2E Bạc xỉu'), stock: 5 });
  const user = await registerCustomer();

  const customerContext = await browser.newContext();
  const staffContext = await browser.newContext();
  try {
    // Khách đặt đơn, chọn trả tại quầy
    const customer = await customerContext.newPage();
    await logIn(customer, user.email, user.password);
    await addToCart(customer, product.name, { size: 'S' });
    await goToCheckout(customer);
    await customer.getByRole('radio', { name: 'Tiền mặt tại quầy' }).check();
    await placeOrderButton(customer).click();
    await expect(customer).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);
    await expect(customer.getByRole('main')).toContainText('ra quầy trả tiền mặt');
    const code = (await customer.getByRole('heading', { name: /^Đơn BL-/ }).innerText()).replace('Đơn ', '');

    // Nhân viên xử lý đơn trên màn hình quầy
    const staff = await staffContext.newPage();
    await logIn(staff, 'staff@brewlite.vn', 'Staff@123', '/staff');
    const card = staff.getByRole('main').getByRole('listitem').filter({ hasText: code }).first();
    await expect(card).toContainText(product.name);
    await expect(card).toContainText('Tiền mặt tại quầy');
    await card.getByRole('button', { name: 'Đã thu tiền mặt' }).click();
    await card.getByRole('button', { name: 'Bắt đầu pha chế' }).click();

    // Khách bấm làm mới và thấy đơn đang được pha chế
    await customer.getByRole('button', { name: 'Làm mới' }).click();
    await expect(customer.getByRole('main')).toContainText('Quầy đang chuẩn bị đồ uống của bạn.');
    await expect(customer.getByRole('button', { name: 'Hủy đơn' })).toHaveCount(0);

    await card.getByRole('button', { name: 'Pha chế xong' }).click();
    await card.getByRole('button', { name: 'Đã giao khách' }).click();
    await expect(card).toHaveCount(0); // đơn xong rời khỏi danh sách cần xử lý

    await customer.getByRole('button', { name: 'Làm mới' }).click();
    await expect(customer.getByRole('main')).toContainText('Cảm ơn bạn đã đặt hàng.');
  } finally {
    await customerContext.close();
    await staffContext.close();
    await hideProduct(manager, product.id);
  }
});

test('E2E-T04: khách hủy đơn đã trả, không vào được màn hình quầy', async ({ page }) => {
  const manager = await loginManager();
  const product = await createProduct(manager, { name: unique('E2E Trà'), stock: 5 });
  const user = await registerCustomer();
  try {
    await logIn(page, user.email, user.password);
    await addToCart(page, product.name, { size: 'S' });
    await goToCheckout(page);
    await placeOrderButton(page).click();
    await page.getByRole('button', { name: 'Xác nhận thanh toán' }).click();
    await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/);

    await page.getByRole('button', { name: 'Hủy đơn' }).click();
    await page.getByRole('button', { name: 'Xác nhận hủy' }).click();
    await expect(page.getByRole('main')).toContainText('Đơn này đã bị hủy.');
    await expect(page.getByRole('main')).toContainText('đã hoàn tiền');

    await page.goto('/staff');
    await expect(page.getByText('Bạn không có quyền xem trang này')).toBeVisible();

    // Đăng xuất thì giỏ trống, người sau dùng chung máy không thấy giỏ của người trước
    await addToCart(page, product.name, { size: 'S' });
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Đăng xuất' }).click();
    await expect(page.getByRole('link', { name: 'Đăng nhập' })).toBeVisible();
    await page.goto('/cart');
    await expect(page.getByRole('link', { name: 'Thanh toán' })).toHaveCount(0);
  } finally {
    await hideProduct(manager, product.id);
  }
});
