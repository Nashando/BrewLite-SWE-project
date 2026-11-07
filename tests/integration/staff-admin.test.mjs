import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import {
  call,
  createOrder,
  createProduct,
  hideProduct,
  lineOf,
  loginManager,
  loginStaff,
  orderOf,
  pay,
  registerCustomer,
  stockOf,
  unique,
} from '../helpers/api.mjs';

let manager;
let staff;
const created = [];

const product = async (overrides) => {
  const p = await createProduct(manager, overrides);
  created.push(p.id);
  return p;
};

before(async () => {
  [manager, staff] = await Promise.all([loginManager(), loginStaff()]);
});
after(() => Promise.all(created.map((id) => hideProduct(manager, id))));

const setStatus = (token, id, status) => call('PATCH', `/orders/${id}/status`, { token, body: { status } });

test('INT-T05: nhân viên chuyển trạng thái đơn đúng thứ tự, khách không đổi được', async () => {
  const p = await product();
  const user = await registerCustomer();
  const order = (await createOrder(user.token, [lineOf(p)])).body;

  assert.equal((await setStatus(staff, order.id, 'PREPARING')).status, 409, 'đơn chưa trả');
  await pay(user.token, order.id, 'WALLET');

  assert.equal((await setStatus(user.token, order.id, 'PREPARING')).status, 403);
  assert.equal((await setStatus(staff, order.id, 'READY')).status, 409, 'không được nhảy bước');
  for (const status of ['PREPARING', 'READY', 'COMPLETED']) {
    assert.equal((await setStatus(staff, order.id, status)).status, 200, status);
    assert.equal((await orderOf(user.token, order.id)).status, status);
  }
  assert.equal((await setStatus(staff, order.id, 'COMPLETED')).status, 409);
});

test('INT-T05: chỉ khách hàng mới đặt được đơn và thanh toán', async () => {
  const p = await product();
  const customer = await registerCustomer();
  const order = (await createOrder(customer.token, [lineOf(p)])).body;

  for (const token of [staff, manager]) {
    assert.equal((await createOrder(token, [lineOf(p)])).status, 403);
    assert.equal((await pay(token, order.id, 'WALLET')).status, 403);
    assert.equal((await call('GET', '/cart', { token })).status, 403);
    assert.equal((await call('POST', '/cart/items', { token, body: { productId: p.id, sizeId: p.sizes[0].id, quantity: 1 } })).status, 403);
  }
  assert.equal((await orderOf(customer.token, order.id)).status, 'PENDING_PAYMENT');
  assert.equal(await stockOf(manager, p.id), 9, 'đơn bị chặn không trừ kho');
  assert.equal((await call('GET', '/cart', { token: customer.token })).status, 200);
});

test('INT-T05: khách chỉ thấy đơn của mình; nhân viên thấy tất cả, kèm tên khách', async () => {
  const p = await product();
  const a = await registerCustomer();
  const b = await registerCustomer();
  const order = (await createOrder(a.token, [lineOf(p)])).body;

  assert.equal((await call('GET', `/orders/${order.id}`, { token: b.token })).status, 404);
  assert.equal((await call('GET', `/orders/code/${order.code}`, { token: b.token })).status, 404);
  assert.deepEqual((await call('GET', '/orders', { token: b.token })).body, []);
  assert.equal((await call('GET', '/orders/all', { token: a.token })).status, 403);

  const all = await call('GET', '/orders/all', { token: staff });
  assert.equal(all.body.find((o) => o.id === order.id).customer.email, a.email);
  assert.equal((await call('GET', '/orders', { token: a.token })).body[0].id, order.id);
});

test('INT-T05: trang quản lý chỉ dành cho quản lý', async () => {
  const customer = await registerCustomer();
  for (const path of ['/admin/products', '/admin/toppings', '/admin/reports/revenue']) {
    assert.equal((await call('GET', path)).status, 401, path);
    assert.equal((await call('GET', path, { token: customer.token })).status, 403, path);
    assert.equal((await call('GET', path, { token: staff })).status, 403, path);
    assert.equal((await call('GET', path, { token: manager })).status, 200, path);
  }
});

test('INT-T05: quản lý thêm, sửa, ẩn món; món cập nhật trên menu khách', async () => {
  const p = await product({ basePrice: 30000 });
  assert.ok((await call('GET', '/products')).body.some((x) => x.id === p.id));

  const updated = await call('PATCH', `/admin/products/${p.id}`, {
    token: manager,
    body: { basePrice: 32000, sizes: [{ id: p.sizes[0].id, name: 'Nhỏ', extraPrice: 0 }, { name: 'XL', extraPrice: 9000 }] },
  });
  assert.equal(updated.status, 200);
  assert.deepEqual(updated.body.sizes.map((s) => s.name), ['Nhỏ', 'XL']);
  assert.equal((await call('GET', `/products/${p.id}`)).body.basePrice, 32000);

  assert.equal((await call('PATCH', `/admin/products/${p.id}`, { token: manager, body: { basePrice: -1 } })).status, 400);
  assert.equal((await call('PATCH', `/admin/products/${p.id}`, { token: manager, body: { imageUrl: 'javascript:alert(1)' } })).status, 400);

  await hideProduct(manager, p.id);
  assert.ok(!(await call('GET', '/products')).body.some((x) => x.id === p.id));
  assert.equal((await call('GET', `/products/${p.id}`)).status, 404);
  assert.ok((await call('GET', '/admin/products', { token: manager })).body.some((x) => x.id === p.id));
});

test('INT-T05: chỉnh kho không làm âm và an toàn khi đồng thời', async () => {
  const p = await product({ stock: 5 });
  const adjust = (delta) => call('POST', `/admin/products/${p.id}/stock`, { token: manager, body: { delta } });

  assert.equal((await adjust(10)).body.stock, 15);
  assert.equal((await adjust(-99)).status, 400);
  assert.equal((await adjust(0)).status, 400);
  const res = await Promise.all(Array.from({ length: 20 }, () => adjust(-1)));
  assert.equal(res.filter((r) => r.status === 201).length, 15);
  assert.equal(await stockOf(manager, p.id), 0);
});

test('INT-T05: topping ẩn không còn chọn được khi đặt đơn', async () => {
  const p = await product();
  const user = await registerCustomer();
  const topping = (await call('POST', '/admin/toppings', { token: manager, body: { name: unique('Topping'), price: 4000 } })).body;
  const line = { ...lineOf(p), toppingIds: [topping.id] };

  const ok = await createOrder(user.token, [line]);
  assert.equal(ok.status, 201);
  assert.equal(ok.body.total, 34000);

  await call('PATCH', `/admin/toppings/${topping.id}`, { token: manager, body: { isActive: false } });
  assert.equal((await createOrder(user.token, [line])).status, 400);
});

// Các file test chạy tuần tự (--test-concurrency=1) nên chênh lệch doanh thu chỉ đến từ đơn trong test này
test('INT-T05: doanh thu chỉ tính đơn đã trả, không tính đơn chờ và đơn huỷ', async () => {
  const p = await product({ basePrice: 41000 });
  const user = await registerCustomer();
  const report = async () => (await call('GET', '/admin/reports/revenue?days=7', { token: manager })).body;

  assert.equal((await call('GET', '/admin/reports/revenue?days=5', { token: manager })).status, 400);
  const start = await report();
  assert.equal(start.daily.length, 7);
  assert.equal(start.daily.reduce((sum, d) => sum + d.revenue, 0), start.revenue);
  assert.ok(start.topProducts.length <= 5);

  const order = (await createOrder(user.token, [lineOf(p)])).body;
  assert.equal((await report()).revenue, start.revenue, 'đơn chờ không tính');

  await pay(user.token, order.id, 'WALLET');
  const paid = await report();
  assert.equal(paid.revenue, start.revenue + 41000, 'đơn đã trả được tính');
  assert.equal(paid.orderCount, start.orderCount + 1);

  await call('POST', `/orders/${order.id}/cancel`, { token: user.token });
  const cancelled = await report();
  assert.equal(cancelled.revenue, start.revenue, 'đơn huỷ không tính');
  assert.equal(cancelled.orderCount, start.orderCount);
});
