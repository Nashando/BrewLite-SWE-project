import { http, HttpResponse } from 'msw';
import { API_URL } from '@/lib/env';
import type { AuthSession, Order, Payment, PaymentMethod } from '@/types';
import { mockProductDetails, mockProducts } from './data';

// ---- "Backend" giả trong bộ nhớ, dùng khi dev (NEXT_PUBLIC_API_MOCKING=enabled) và cho test ----
// Tài khoản có sẵn: demo@brewlite.vn / 123456
// Thẻ bắt đầu bằng 4000 bị từ chối, các thẻ khác và Ví luôn thành công.

interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

const users: MockUser[] = [
  { id: 'u-1', name: 'Khách demo', email: 'demo@brewlite.vn', password: '123456' },
];
const orders: Order[] = [];
const paymentsByKey = new Map<string, Payment>();

const toSession = (u: MockUser): AuthSession => ({
  accessToken: `mock-token-${u.id}`,
  user: { id: u.id, name: u.name, email: u.email },
});

const isAuthed = (request: Request) =>
  request.headers.get('authorization')?.startsWith('Bearer mock-token-') ?? false;

const unauthorized = () =>
  HttpResponse.json({ statusCode: 401, message: 'Chưa đăng nhập' }, { status: 401 });

interface OrderBody {
  items: { productId: string; sizeId: string | null; toppingIds: string[]; quantity: number }[];
}

interface PaymentBody {
  orderId: string;
  method: PaymentMethod;
  card?: { number: string };
}

export const handlers = [
  http.get(`${API_URL}/products`, () => HttpResponse.json(mockProducts)),

  http.get(`${API_URL}/products/:id`, ({ params }) => {
    const product = mockProductDetails.find((p) => p.id === params.id);
    return product
      ? HttpResponse.json(product)
      : HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy sản phẩm' }, { status: 404 });
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string };
    const user = users.find((u) => u.email === email && u.password === password);
    return user
      ? HttpResponse.json(toSession(user))
      : HttpResponse.json(
          { statusCode: 401, message: 'Email hoặc mật khẩu không đúng' },
          { status: 401 },
        );
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const { name, email, password } = (await request.json()) as Omit<MockUser, 'id'>;
    if (users.some((u) => u.email === email)) {
      return HttpResponse.json(
        { statusCode: 409, message: 'Email đã được đăng ký' },
        { status: 409 },
      );
    }
    const user = { id: `u-${users.length + 1}`, name, email, password };
    users.push(user);
    return HttpResponse.json(toSession(user), { status: 201 });
  }),

  http.post(`${API_URL}/orders`, async ({ request }) => {
    if (!isAuthed(request)) return unauthorized();
    const body = (await request.json()) as OrderBody;

    const items: Order['items'] = [];
    for (const line of body.items) {
      const product = mockProductDetails.find((p) => p.id === line.productId);
      if (!product || !product.isAvailable) {
        return HttpResponse.json(
          {
            statusCode: 409,
            code: 'OUT_OF_STOCK',
            message: `${product?.name ?? 'Một món'} đã hết hàng`,
          },
          { status: 409 },
        );
      }
      const size = product.sizes.find((s) => s.id === line.sizeId);
      const toppings = product.toppings.filter((t) => line.toppingIds.includes(t.id));
      items.push({
        productName: product.name,
        sizeName: size?.name ?? null,
        toppings: toppings.map((t) => t.name),
        quantity: line.quantity,
        unitPrice:
          product.basePrice + (size?.extraPrice ?? 0) + toppings.reduce((s, t) => s + t.price, 0),
      });
    }

    const order: Order = {
      id: `o-${orders.length + 1}`,
      code: `BL-${1001 + orders.length}`,
      status: 'PENDING_PAYMENT',
      total: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      createdAt: new Date().toISOString(),
      items,
    };
    orders.push(order);
    return HttpResponse.json(order, { status: 201 });
  }),

  http.post(`${API_URL}/payments`, async ({ request }) => {
    if (!isAuthed(request)) return unauthorized();
    const key = request.headers.get('idempotency-key');
    if (key && paymentsByKey.has(key)) return HttpResponse.json(paymentsByKey.get(key)); // gửi lại cùng khóa

    const body = (await request.json()) as PaymentBody;
    const order = orders.find((o) => o.id === body.orderId);
    if (!order) {
      return HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy đơn' }, { status: 404 });
    }

    const declined = body.method === 'CARD' && body.card?.number.startsWith('4000');
    const payment: Payment = {
      id: `pay-${paymentsByKey.size + 1}`,
      orderId: order.id,
      method: body.method,
      status: declined ? 'FAILED' : 'SUCCESS',
      failureReason: declined ? 'Thẻ bị từ chối. Vui lòng dùng thẻ khác.' : null,
    };
    if (!declined) order.status = 'PAID';
    if (key) paymentsByKey.set(key, payment);
    return HttpResponse.json(payment, { status: 201 });
  }),

  http.get(`${API_URL}/orders`, ({ request }) =>
    isAuthed(request) ? HttpResponse.json([...orders].reverse()) : unauthorized(),
  ),

  http.get(`${API_URL}/orders/:id`, ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized();
    const order = orders.find((o) => o.id === params.id);
    return order
      ? HttpResponse.json(order)
      : HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy đơn' }, { status: 404 });
  }),
];
