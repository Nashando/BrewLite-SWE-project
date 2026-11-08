import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import pg from 'pg';
import {
  balanceOf,
  call,
  countStatuses,
  createOrder,
  createProduct,
  goodCard,
  hideProduct,
  lineOf,
  loginManager,
  loginStaff,
  orderOf,
  pay,
  registerCustomer,
  stockOf,
} from '../helpers/api.mjs';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://brewlite:brewlite@localhost:5432/brewlite';

let manager;
let staff;
const created = [];

before(async () => {
  [manager, staff] = await Promise.all([loginManager(), loginStaff()]);
});
after(() => Promise.all(created.map((id) => hideProduct(manager, id))));

async function orderReady({ stock = 10, basePrice = 30000, quantity = 1 } = {}) {
  const p = await createProduct(manager, { stock, basePrice });
  created.push(p.id);
  const user = await registerCustomer();
  const order = (await createOrder(user.token, [lineOf(p, quantity)])).body;
  return { p, user, order };
}

const confirmCash = (token, id) => call('POST', `/orders/${id}/confirm-cash`, { token });
const cancel = (token, id) => call('POST', `/orders/${id}/cancel`, { token });

/** Giả lập đơn đã giữ hàng quá 15 phút. */
async function ageOrder(id) {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query(`update "Order" set "createdAt" = now() - interval '20 minutes' where id = $1`, [id]);
  } finally {
    await client.end();
  }
}

test('INT-T04: tiền mặt: đơn chờ thu, nhân viên xác nhận thì đơn PAID', async () => {
  const { user, order } = await orderReady();

  const res = await pay(user.token, order.id, 'CASH');
  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'PENDING');
  assert.equal((await orderOf(user.token, order.id)).status, 'PENDING_PAYMENT');

  assert.equal((await confirmCash(user.token, order.id)).status, 403, 'khách không tự xác nhận được');
  assert.equal((await confirmCash(staff, order.id)).status, 201);

  const paid = await orderOf(user.token, order.id);
  assert.equal(paid.status, 'PAID');
  assert.equal(paid.payments[0].status, 'SUCCESS');
  assert.equal(await balanceOf(user.token), 200000, 'tiền mặt không trừ ví');
});

test('INT-T04: đang chờ tiền mặt thì không trả thêm bằng ví, thẻ', async () => {
  const { user, order } = await orderReady();
  await pay(user.token, order.id, 'CASH');

  assert.equal((await pay(user.token, order.id, 'WALLET')).status, 409);
  assert.equal((await pay(user.token, order.id, 'CARD', { card: goodCard })).status, 409);
  assert.equal(await balanceOf(user.token), 200000);
});

test('INT-T04: xác nhận tiền mặt: nhiều nhân viên cùng lúc chỉ một lần được, đơn không chọn tiền mặt bị từ chối', async () => {
  const { user, order } = await orderReady();
  await pay(user.token, order.id, 'CASH');
  const res = await Promise.all([1, 2, 3].map(() => confirmCash(staff, order.id)));
  assert.deepEqual(countStatuses(res), { 201: 1, 409: 2 });

  const other = await orderReady();
  assert.equal((await confirmCash(staff, other.order.id)).status, 409);
  assert.equal((await orderOf(other.user.token, other.order.id)).status, 'PENDING_PAYMENT', 'phải rollback');
});

test('INT-T04: đơn quá 15 phút chưa thanh toán tự huỷ, trả kho, không xác nhận được nữa', async () => {
  const { p, user, order } = await orderReady({ stock: 5 });
  await pay(user.token, order.id, 'CASH');
  assert.equal(await stockOf(manager, p.id), 4);

  await ageOrder(order.id);

  const expired = await orderOf(user.token, order.id);
  assert.equal(expired.status, 'CANCELLED');
  assert.equal(expired.payments[0].status, 'FAILED');
  assert.equal(await stockOf(manager, p.id), 5);
  assert.equal((await confirmCash(staff, order.id)).status, 409);
  assert.equal((await pay(user.token, order.id, 'WALLET')).status, 409);
});

test('INT-T04: huỷ đơn đã trả bằng ví: hoàn số dư, trả kho, chỉ hoàn một lần', async () => {
  const { p, user, order } = await orderReady({ stock: 5, basePrice: 30000, quantity: 2 });
  await pay(user.token, order.id, 'WALLET');
  assert.equal(await balanceOf(user.token), 140000);

  const res = await Promise.all([1, 2, 3].map(() => cancel(user.token, order.id)));

  assert.deepEqual(countStatuses(res), { 201: 1, 409: 2 });
  assert.equal(await balanceOf(user.token), 200000);
  assert.equal(await stockOf(manager, p.id), 5);
  const cancelled = await orderOf(user.token, order.id);
  assert.equal(cancelled.status, 'CANCELLED');
  assert.equal(cancelled.payments[0].status, 'REFUNDED');
});

test('INT-T04: huỷ đơn đã trả bằng thẻ: giao dịch REFUNDED, số dư ví không đổi', async () => {
  const { user, order } = await orderReady();
  await pay(user.token, order.id, 'CARD', { card: goodCard });
  assert.equal((await cancel(user.token, order.id)).status, 201);
  assert.equal(await balanceOf(user.token), 200000);
  assert.equal((await orderOf(user.token, order.id)).payments[0].status, 'REFUNDED');
});

test('INT-T04: không huỷ được đơn của người khác và đơn đã bắt đầu pha chế', async () => {
  const { user, order } = await orderReady();
  await pay(user.token, order.id, 'WALLET');
  const stranger = await registerCustomer();
  assert.equal((await cancel(stranger.token, order.id)).status, 404);

  await call('PATCH', `/orders/${order.id}/status`, { token: staff, body: { status: 'PREPARING' } });
  assert.equal((await cancel(user.token, order.id)).status, 409);
});
