import assert from 'node:assert/strict';
import { test } from 'node:test';
import { call, registerCustomer, uuid } from '../helpers/api.mjs';

test('INT-T01: đăng ký rồi đăng nhập nhận JWT, ví khởi tạo 500.000đ', async () => {
  const user = await registerCustomer();
  const login = await call('POST', '/auth/login', { body: { email: user.email, password: user.password } });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.role, 'CUSTOMER');

  const me = await call('GET', '/auth/me', { token: login.body.accessToken });
  assert.equal(me.status, 200);
  assert.equal(me.body.email, user.email);
  assert.equal(me.body.walletBalance, 500000);
  assert.equal(me.body.password, undefined, 'không được trả mật khẩu');
});

test('INT-T01: đăng ký sai dữ liệu hoặc trùng email bị từ chối', async () => {
  const email = `${uuid().slice(0, 12)}@test.brewlite.vn`;
  const short = await call('POST', '/auth/register', { body: { name: 'A', email, password: '1234567' } });
  assert.equal(short.status, 400);
  const badEmail = await call('POST', '/auth/register', { body: { name: 'A', email: 'abc', password: 'password123' } });
  assert.equal(badEmail.status, 400);

  const first = await call('POST', '/auth/register', { body: { name: 'A', email, password: 'password123' } });
  assert.equal(first.status, 201);
  const dup = await call('POST', '/auth/register', { body: { name: 'A', email, password: 'password123' } });
  assert.equal(dup.status, 409);
});

test('INT-T01: sai mật khẩu và token không hợp lệ đều 401', async () => {
  const user = await registerCustomer();
  const wrong = await call('POST', '/auth/login', { body: { email: user.email, password: 'sai-mat-khau' } });
  assert.equal(wrong.status, 401);

  assert.equal((await call('GET', '/auth/me')).status, 401);
  assert.equal((await call('GET', '/auth/me', { token: 'abc.def.ghi' })).status, 401);

  const login = await call('POST', '/auth/login', { body: { email: user.email, password: user.password } });
  assert.equal((await call('GET', '/auth/me', { token: login.body.refreshToken })).status, 401, 'refresh token không dùng gọi API thường');
});
