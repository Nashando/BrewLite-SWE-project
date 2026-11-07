import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import {
  call,
  countStatuses,
  createOrder,
  createProduct,
  hideProduct,
  lineOf,
  loginManager,
  registerCustomer,
  stockOf,
} from '../helpers/api.mjs';

let manager;
const created = [];

const product = async (overrides) => {
  const p = await createProduct(manager, overrides);
  created.push(p.id);
  return p;
};

before(async () => {
  manager = await loginManager();
});
after(() => Promise.all(created.map((id) => hideProduct(manager, id))));

test('INT-T02: tạo đơn cần đăng nhập', async () => {
  const p = await product();
  const res = await call('POST', '/orders', { body: { items: [lineOf(p)] } });
  assert.equal(res.status, 401);
});

test('INT-T02: tạo đơn trong transaction: tính giá ở server, trừ kho, trạng thái chờ thanh toán', async () => {
  const p = await product({ basePrice: 40000, stock: 10 });
  const { token } = await registerCustomer();
  const res = await createOrder(token, [lineOf(p, 2, 1)]); // size L phụ thu 5.000

  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'PENDING_PAYMENT');
  assert.equal(res.body.total, 90000);
  assert.match(res.body.code, /^BL-/);
  assert.deepEqual(res.body.items[0], {
    productName: p.name,
    sizeName: 'L',
    toppings: [],
    quantity: 2,
    unitPrice: 45000,
  });
  assert.equal(await stockOf(manager, p.id), 8);
});

test('INT-T02: dữ liệu sai bị từ chối và không trừ kho', async () => {
  const p = await product({ stock: 10 });
  const other = await product();
  const { token } = await registerCustomer();

  const cases = [
    { items: [] },
    { items: [{ ...lineOf(p), quantity: 0 }] },
    { items: [{ ...lineOf(p), price: 1 }] }, // không cho client gửi giá
    { items: [{ ...lineOf(p), sizeId: null }] }, // món có size bắt buộc chọn
    { items: [{ ...lineOf(p), sizeId: other.sizes[0].id }] }, // size của món khác
  ];
  for (const body of cases) {
    const res = await call('POST', '/orders', { token, body });
    assert.equal(res.status, 400, JSON.stringify(body));
  }
  assert.equal(await stockOf(manager, p.id), 10);
});

test('INT-T02: id sai định dạng từ giỏ cũ: báo tiếng Việt, không lộ lỗi kỹ thuật', async () => {
  const { token } = await registerCustomer();
  const res = await call('POST', '/orders', {
    token,
    body: { items: [{ productId: 'p-01', sizeId: 'size-l', toppingIds: ['top-shot'], quantity: 1 }] },
  });
  assert.equal(res.status, 400);
  assert.match(res.body.message.join(' '), /không còn hợp lệ/);
  assert.doesNotMatch(res.body.message.join(' '), /UUID/);
});

test('INT-T02: hết hàng trả 400 OUT_OF_STOCK, rollback cả các món khác trong đơn', async () => {
  const enough = await product({ stock: 10 });
  const short = await product({ stock: 1 });
  const { token } = await registerCustomer();

  const res = await createOrder(token, [lineOf(enough, 2), lineOf(short, 2)]);

  assert.equal(res.status, 400);
  assert.equal(res.body.code, 'OUT_OF_STOCK');
  assert.match(res.body.message, /không đủ số lượng tồn kho/);
  assert.deepEqual(res.body.outOfStock, [short.name]);
  assert.equal(await stockOf(manager, enough.id), 10);
  assert.equal(await stockOf(manager, short.id), 1);
});

test('INT-T02: nhiều người đặt cùng lúc không làm âm kho', async () => {
  const p = await product({ stock: 3 });
  const users = await Promise.all(Array.from({ length: 10 }, registerCustomer));

  const res = await Promise.all(users.map((u) => createOrder(u.token, [lineOf(p)])));

  assert.deepEqual(countStatuses(res), { 201: 3, 400: 7 });
  assert.equal(await stockOf(manager, p.id), 0);
});

test('INT-T02: đơn đồng thời có thứ tự món ngược nhau không bị deadlock', async () => {
  const a = await product({ stock: 1000 });
  const b = await product({ stock: 1000 });
  const { token } = await registerCustomer();

  const res = await Promise.all(
    Array.from({ length: 40 }, (_, i) => createOrder(token, i % 2 ? [lineOf(a), lineOf(b)] : [lineOf(b), lineOf(a)])),
  );

  assert.deepEqual(countStatuses(res), { 201: 40 });
  assert.equal(await stockOf(manager, a.id), 960);
  assert.equal(await stockOf(manager, b.id), 960);
});
