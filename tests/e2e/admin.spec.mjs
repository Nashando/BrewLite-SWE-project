import { expect, test } from '@playwright/test';
import { call, loginManager, unique } from '../helpers/api.mjs';
import { logIn } from './helpers.mjs';

test('E2E-T05: quản lý thêm món, món lên menu, chỉnh kho, ẩn món và xem doanh thu', async ({ page }) => {
  const name = unique('E2E Matcha');
  let createdId;
  try {
    await logIn(page, 'manager@brewlite.vn', 'Manager@123', '/admin/products');

    await page.getByRole('button', { name: 'Thêm món' }).click();
    await page.getByLabel('Tên món').fill(name);
    await page.getByLabel('Danh mục').fill('Trà');
    await page.getByLabel('Giá gốc (₫)').fill('42000');
    await page.getByLabel('Tồn kho ban đầu').fill('8');
    await page.getByRole('button', { name: 'Thêm size' }).click();
    await page.getByLabel('Tên size 1').fill('S');
    await page.getByRole('button', { name: 'Lưu món' }).click();
    const edit = page.getByRole('button', { name: `Sửa ${name}` });
    await expect(edit).toBeVisible();

    const manager = await loginManager();
    createdId = (await call('GET', '/admin/products', { token: manager })).body.find((p) => p.name === name).id;

    // Món mới hiện trên menu của khách
    await page.goto('/menu');
    await page.getByRole('searchbox', { name: 'Tìm món' }).fill(name);
    await expect(page.getByRole('heading', { name })).toBeVisible();

    // Chỉnh kho: nhập thêm được, giảm quá số tồn thì báo lỗi
    await page.goto('/admin/products');
    await edit.click();
    const stock = page.getByRole('region', { name: 'Tồn kho' });
    await stock.getByLabel(/Số lượng thay đổi/).fill('5');
    await stock.getByRole('button', { name: 'Cập nhật kho' }).click();
    await expect(stock).toContainText('Tồn kho hiện tại: 13');
    await stock.getByLabel(/Số lượng thay đổi/).fill('-99');
    await stock.getByRole('button', { name: 'Cập nhật kho' }).click();
    await expect(stock.getByRole('alert')).toContainText('Tồn kho chỉ còn 13');

    // Ẩn món: không còn trên menu
    await page.getByRole('checkbox', { name: /Đang bán/ }).uncheck();
    await page.getByRole('button', { name: 'Lưu món' }).click();
    await expect(edit).toBeVisible();
    await page.goto('/menu');
    await expect(page.getByRole('searchbox', { name: 'Tìm món' })).toBeVisible();
    await page.getByRole('searchbox', { name: 'Tìm món' }).fill(name);
    await expect(page.getByRole('heading', { name })).toHaveCount(0);

    // Doanh thu: có tổng quan; khi có đơn thì có biểu đồ và bảng số liệu
    await page.goto('/admin/revenue');
    await page.getByRole('button', { name: '30 ngày' }).click();
    const overview = page.getByRole('region', { name: 'Tổng quan' });
    await expect(overview).toContainText('Doanh thu');
    await expect(overview).toContainText('Số đơn');
  } finally {
    if (createdId) {
      const manager = await loginManager();
      await call('PATCH', `/admin/products/${createdId}`, { token: manager, body: { isActive: false } });
    }
  }
});

test('E2E-T05: nhân viên không vào được trang quản lý', async ({ page }) => {
  await logIn(page, 'staff@brewlite.vn', 'Staff@123', '/staff');
  await page.goto('/admin/products');
  await expect(page.getByText('Bạn không có quyền xem trang này')).toBeVisible();
});
