import { randomUUID } from 'node:crypto';

export const API_URL = process.env.API_URL ?? 'http://localhost:3001';
export const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000';

export const uuid = randomUUID;
export const unique = (prefix) => `${prefix} ${randomUUID().slice(0, 8)}`;

/** Gọi API, trả về { status, body } và không ném lỗi với mã 4xx/5xx để test tự kiểm tra. */
export async function call(method, path, { token, body, headers } = {}) {
  const res = await fetch(API_URL + path, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

/** Đếm số lần xuất hiện của mỗi mã trạng thái, ví dụ { 201: 1, 409: 7 }. */
export const countStatuses = (responses) =>
  responses.reduce((acc, { status }) => ({ ...acc, [status]: (acc[status] ?? 0) + 1 }), {});

export async function login(email, password) {
  const { status, body } = await call('POST', '/auth/login', { body: { email, password } });
  if (status !== 200) throw new Error(`Không đăng nhập được ${email} (${status}). Đã chạy seed chưa?`);
  return body.accessToken;
}

export const loginManager = () => login('manager@brewlite.vn', 'Manager@123');
export const loginStaff = () => login('staff@brewlite.vn', 'Staff@123');

export async function registerCustomer() {
  const email = `${randomUUID().slice(0, 12)}@test.brewlite.vn`;
  const password = 'password123';
  const { status, body } = await call('POST', '/auth/register', { body: { name: 'Khách test', email, password } });
  if (status !== 201) throw new Error(`Không đăng ký được (${status})`);
  return { email, password, name: 'Khách test', token: body.accessToken, id: body.user.id };
}

/** Tạo món riêng cho từng test để không tranh tồn kho với test khác. */
export async function createProduct(managerToken, overrides = {}) {
  const { status, body } = await call('POST', '/admin/products', {
    token: managerToken,
    body: {
      name: unique('Món test'),
      category: 'Test',
      basePrice: 30000,
      stock: 10,
      sizes: [
        { name: 'S', extraPrice: 0 },
        { name: 'L', extraPrice: 5000 },
      ],
      ...overrides,
    },
  });
  if (status !== 201) throw new Error(`Không tạo được món (${status}): ${JSON.stringify(body)}`);
  return body;
}

/** Ẩn món sau khi test xong để menu không đầy món test. */
export const hideProduct = (managerToken, id) =>
  call('PATCH', `/admin/products/${id}`, { token: managerToken, body: { isActive: false } });

export const stockOf = async (managerToken, id) => {
  const { body } = await call('GET', '/admin/products', { token: managerToken });
  return body.find((p) => p.id === id).stock;
};

export const lineOf = (product, quantity = 1, sizeIndex = 0) => ({
  productId: product.id,
  sizeId: product.sizes[sizeIndex]?.id ?? null,
  toppingIds: [],
  quantity,
});

export const createOrder = (token, lines) => call('POST', '/orders', { token, body: { items: lines } });

export const pay = (token, orderId, method, { key = randomUUID(), card } = {}) =>
  call('POST', '/payments', {
    token,
    headers: { 'Idempotency-Key': key },
    body: { orderId, method, ...(card ? { card } : {}) },
  });

export const goodCard = { number: '4242 4242 4242 4242', expiry: '12/40', cvv: '123' };
export const declinedCard = { number: '4000 0000 0000 1234', expiry: '12/40', cvv: '123' };

export const balanceOf = async (token) => (await call('GET', '/auth/me', { token })).body.walletBalance;
export const orderOf = async (token, id) => (await call('GET', `/orders/${id}`, { token })).body;
