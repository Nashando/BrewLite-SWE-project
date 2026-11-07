import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import {
  balanceOf,
  call,
  countStatuses,
  createOrder,
  createProduct,
  declinedCard,
  goodCard,
  hideProduct,
  lineOf,
  loginManager,
  orderOf,
  pay,
  registerCustomer,
  stockOf,
  uuid,
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

/** Tài khoản mới và một đơn đang chờ thanh toán. */
async function orderReady({ basePrice = 30000, stock = 10, quantity = 1 } = {}) {
  const p = await product({ basePrice, stock });
  const user = await registerCustomer();
  const order = (await createOrder(user.token, [lineOf(p, quantity)])).body;
  return { p, user, order };
}

test('INT-T03: trả bằng ví thành công: trừ số dư, đơn PAID', async () => {
  const { user, order } = await orderReady({ basePrice: 30000 });

  const res = await pay(user.token, order.id, 'WALLET');

  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'SUCCESS');
  assert.equal(res.body.method, 'WALLET');
  assert.match(res.body.transactionRef, /^TXN-/);
  assert.equal(await balanceOf(user.token), 170000);
  assert.equal((await orderOf(user.token, order.id)).status, 'PAID');
});

test('INT-T03: ví không đủ tiền: 402, huỷ đơn, trả kho, không trừ số dư', async () => {
  const { p, user, order } = await orderReady({ basePrice: 300000, stock: 5 });
  assert.equal(await stockOf(manager, p.id), 4);

  const res = await pay(user.token, order.id, 'WALLET');

  assert.equal(res.status, 402);
  assert.equal(res.body.code, 'PAYMENT_FAILED');
  assert.equal(res.body.message, 'Số dư ví không đủ');
  assert.equal(await balanceOf(user.token), 200000);
  assert.equal((await orderOf(user.token, order.id)).status, 'CANCELLED');
  assert.equal(await stockOf(manager, p.id), 5);
});

test('INT-T03: trả bằng thẻ thành công, không đụng tới ví', async () => {
  const { user, order } = await orderReady();

  const res = await pay(user.token, order.id, 'CARD', { card: goodCard });

  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'SUCCESS');
  assert.equal(await balanceOf(user.token), 200000);
  assert.equal((await orderOf(user.token, order.id)).status, 'PAID');
});

test('INT-T03: thẻ bị từ chối: 402, huỷ đơn, trả kho; thử lại bằng đơn mới thì thành công', async () => {
  const { p, user, order } = await orderReady({ stock: 5 });

  const res = await pay(user.token, order.id, 'CARD', { card: declinedCard });

  assert.equal(res.status, 402);
  assert.match(res.body.message, /Thẻ bị từ chối/);
  assert.equal((await orderOf(user.token, order.id)).status, 'CANCELLED');
  assert.equal(await stockOf(manager, p.id), 5);

  assert.equal((await pay(user.token, order.id, 'CARD', { card: goodCard })).status, 409, 'đơn đã huỷ không trả được');
  const retry = (await createOrder(user.token, [lineOf(p)])).body;
  assert.equal((await pay(user.token, retry.id, 'CARD', { card: goodCard })).status, 201);
});

test('INT-T03: dữ liệu thanh toán sai bị từ chối, đơn vẫn chờ', async () => {
  const { user, order } = await orderReady();
  const body = (extra) => ({ token: user.token, headers: { 'Idempotency-Key': uuid() }, body: { orderId: order.id, ...extra } });

  assert.equal((await call('POST', '/payments', body({ method: 'MOMO' }))).status, 400);
  assert.equal((await call('POST', '/payments', body({ method: 'CARD' }))).status, 400, 'thiếu thông tin thẻ');
  assert.equal((await pay(user.token, order.id, 'CARD', { card: { ...goodCard, expiry: '01/20' } })).status, 400, 'thẻ hết hạn');
  assert.equal((await pay(user.token, order.id, 'CARD', { card: { ...goodCard, cvv: '1' } })).status, 400);
  assert.equal((await call('POST', '/payments', { token: user.token, body: { orderId: order.id, method: 'WALLET' } })).status, 400, 'thiếu Idempotency-Key');
  assert.equal((await orderOf(user.token, order.id)).status, 'PENDING_PAYMENT');
});

test('INT-T03: không trả được đơn của người khác', async () => {
  const { order } = await orderReady();
  const stranger = await registerCustomer();
  assert.equal((await pay(stranger.token, order.id, 'WALLET')).status, 404);
  assert.equal(await balanceOf(stranger.token), 200000);
});

test('INT-T03: gửi lại cùng Idempotency-Key trả kết quả cũ, không trừ tiền lần 2', async () => {
  const { user, order } = await orderReady({ basePrice: 30000 });
  const key = uuid();

  const first = await pay(user.token, order.id, 'WALLET', { key });
  const again = await pay(user.token, order.id, 'WALLET', { key });

  assert.equal(again.status, 201);
  assert.equal(again.body.id, first.body.id);
  assert.equal(await balanceOf(user.token), 170000);
});

test('INT-T03: gửi lại key của lần thất bại vẫn trả 402', async () => {
  const { user, order } = await orderReady();
  const key = uuid();
  await pay(user.token, order.id, 'CARD', { key, card: declinedCard });
  assert.equal((await pay(user.token, order.id, 'CARD', { key, card: goodCard })).status, 402);
});

test('INT-T03: cùng key cho đơn khác bị từ chối', async () => {
  const { p, user, order } = await orderReady();
  const key = uuid();
  await pay(user.token, order.id, 'WALLET', { key });
  const second = (await createOrder(user.token, [lineOf(p)])).body;
  assert.equal((await pay(user.token, second.id, 'WALLET', { key })).status, 409);
});

test('INT-T03: 8 request song song cùng key: mọi request nhận kết quả cũ, trừ tiền một lần', async () => {
  const { user, order } = await orderReady({ basePrice: 30000 });
  const key = uuid();

  const res = await Promise.all(Array.from({ length: 8 }, () => pay(user.token, order.id, 'WALLET', { key })));

  assert.deepEqual(countStatuses(res), { 201: 8 });
  assert.equal(new Set(res.map((r) => r.body.id)).size, 1);
  assert.equal(await balanceOf(user.token), 170000);
});

test('INT-T03: 8 request song song khác key: chỉ một lần thành công', async () => {
  const { user, order } = await orderReady({ basePrice: 30000 });

  const res = await Promise.all(Array.from({ length: 8 }, () => pay(user.token, order.id, 'WALLET')));

  assert.deepEqual(countStatuses(res), { 201: 1, 409: 7 });
  assert.equal(await balanceOf(user.token), 170000);
});

test('INT-T03: 8 request thất bại song song cùng key: chỉ trả kho một lần', async () => {
  const { p, user, order } = await orderReady({ stock: 5 });
  const key = uuid();

  const res = await Promise.all(Array.from({ length: 8 }, () => pay(user.token, order.id, 'CARD', { key, card: declinedCard })));

  assert.deepEqual(countStatuses(res), { 402: 8 });
  assert.equal(await stockOf(manager, p.id), 5);
});

test('INT-T03: ví chỉ đủ một đơn: hai đơn trả song song không làm âm số dư', async () => {
  const p = await product({ basePrice: 150000, stock: 5 });
  const user = await registerCustomer();
  const orders = await Promise.all([1, 2].map(() => createOrder(user.token, [lineOf(p)])));

  const res = await Promise.all(orders.map(({ body }) => pay(user.token, body.id, 'WALLET')));

  assert.deepEqual(countStatuses(res), { 201: 1, 402: 1 });
  assert.equal(await balanceOf(user.token), 50000);
});
