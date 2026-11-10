import { http, HttpResponse } from 'msw';
import { API_URL } from '@/lib/env';
import type {
  AdminProduct,
  AdminTopping,
  AuthSession,
  Order,
  OrderStatus,
  Payment,
  PaymentMethod,
  RevenueReport,
  Role,
} from '@/types';
import { mockProductDetails, mockProducts } from './data';

// ---- "Backend" giả trong bộ nhớ, dùng khi dev (NEXT_PUBLIC_API_MOCKING=enabled) và cho test ----
// Tài khoản có sẵn: demo@brewlite.vn, staff@brewlite.vn, manager@brewlite.vn / 123456
// Thẻ bắt đầu bằng 4000 bị từ chối, ví thiếu tiền thì thất bại.

interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  walletBalance: number;
}

const users: MockUser[] = [
  { id: 'u-1', name: 'Khách demo', email: 'demo@brewlite.vn', password: '123456', role: 'CUSTOMER', walletBalance: 200000 },
  { id: 'u-2', name: 'Nhân viên demo', email: 'staff@brewlite.vn', password: '123456', role: 'STAFF', walletBalance: 200000 },
  { id: 'u-3', name: 'Quản lý demo', email: 'manager@brewlite.vn', password: '123456', role: 'MANAGER', walletBalance: 200000 },
];
const orders: Order[] = [];
const paymentsByKey = new Map<string, Payment>();

const adminProducts: AdminProduct[] = mockProductDetails.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  category: p.category,
  basePrice: p.basePrice,
  imageUrl: p.imageUrl ?? null,
  stock: p.isAvailable ? 50 : 0,
  isActive: true,
  sizes: p.sizes,
}));
const adminToppings: AdminTopping[] = Array.from(
  new Map(mockProductDetails.flatMap((p) => p.toppings).map((t) => [t.id, { ...t, isActive: true }])).values(),
);

const toSession = (u: MockUser): AuthSession => ({
  accessToken: `mock-token-${u.id}`,
  user: { id: u.id, name: u.name, email: u.email, role: u.role },
});

const currentUser = (request: Request) => {
  const id = request.headers.get('authorization')?.match(/^Bearer mock-token-(.+)$/)?.[1];
  return users.find((u) => u.id === id);
};
const isAuthed = (request: Request) => currentUser(request) !== undefined;

const unauthorized = () =>
  HttpResponse.json({ statusCode: 401, message: 'Chưa đăng nhập' }, { status: 401 });
const forbidden = () =>
  HttpResponse.json({ statusCode: 403, message: 'Bạn không có quyền' }, { status: 403 });
const notFound = (message: string) => HttpResponse.json({ statusCode: 404, message }, { status: 404 });
const conflict = (message: string) => HttpResponse.json({ statusCode: 409, message }, { status: 409 });

/** Trả về response lỗi nếu người dùng không có quyền, null nếu hợp lệ. */
function requireRole(request: Request, roles: Role[]) {
  const user = currentUser(request);
  if (!user) return unauthorized();
  return roles.includes(user.role) ? null : forbidden();
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PAID: 'PREPARING',
  PREPARING: 'READY',
  READY: 'COMPLETED',
};

interface OrderBody {
  items: { productId: string; sizeId: string | null; toppingIds: string[]; quantity: number }[];
}

interface PaymentBody {
  orderId: string;
  method: PaymentMethod;
  card?: { number: string };
}

const paymentFailed = (payment: Payment) =>
  HttpResponse.json(
    { statusCode: 402, code: 'PAYMENT_FAILED', message: payment.failureReason, payment },
    { status: 402 },
  );

export const handlers = [
  http.get(`${API_URL}/products`, () => HttpResponse.json(mockProducts)),

  http.get(`${API_URL}/products/:id`, ({ params }) => {
    const product = mockProductDetails.find((p) => p.id === params.id);
    return product ? HttpResponse.json(product) : notFound('Không tìm thấy sản phẩm');
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
    const { name, email, password } = (await request.json()) as Pick<MockUser, 'name' | 'email' | 'password'>;
    if (users.some((u) => u.email === email)) return conflict('Email đã được đăng ký');
    const user: MockUser = { id: `u-${users.length + 1}`, name, email, password, role: 'CUSTOMER', walletBalance: 200000 };
    users.push(user);
    return HttpResponse.json(toSession(user), { status: 201 });
  }),

  http.get(`${API_URL}/auth/me`, ({ request }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json({ ...toSession(user).user, walletBalance: user.walletBalance });
  }),

  http.post(`${API_URL}/orders`, async ({ request }) => {
    const denied = requireRole(request, ['CUSTOMER']);
    if (denied) return denied;
    const body = (await request.json()) as OrderBody;

    const items: Order['items'] = [];
    for (const line of body.items) {
      const product = mockProductDetails.find((p) => p.id === line.productId);
      if (!product || !product.isAvailable) {
        return HttpResponse.json(
          {
            statusCode: 400,
            code: 'OUT_OF_STOCK',
            message: `Sản phẩm "${product?.name ?? 'Một món'}" không đủ số lượng tồn kho.`,
          },
          { status: 400 },
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

    const user = currentUser(request)!;
    const order: Order = {
      id: `o-${orders.length + 1}`,
      code: `BL-${1001 + orders.length}`,
      status: 'PENDING_PAYMENT',
      total: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      createdAt: new Date().toISOString(),
      items,
      payments: [],
      customer: { name: user.name, email: user.email },
    };
    orders.push(order);
    return HttpResponse.json(order, { status: 201 });
  }),

  http.post(`${API_URL}/payments`, async ({ request }) => {
    const denied = requireRole(request, ['CUSTOMER']);
    if (denied) return denied;
    const key = request.headers.get('idempotency-key');
    const previous = key ? paymentsByKey.get(key) : undefined;
    if (previous) {
      // Gửi lại cùng khóa trả lại kết quả cũ
      return previous.status === 'FAILED' ? paymentFailed(previous) : HttpResponse.json(previous, { status: 201 });
    }

    const body = (await request.json()) as PaymentBody;
    const order = orders.find((o) => o.id === body.orderId);
    if (!order) return notFound('Không tìm thấy đơn');
    if (order.status !== 'PENDING_PAYMENT') return conflict('Đơn hàng đã được xử lý');

    const user = currentUser(request)!;
    let failureReason: string | null = null;
    if (body.method === 'WALLET' && user.walletBalance < order.total) failureReason = 'Số dư ví không đủ';
    if (body.method === 'CARD' && body.card?.number.startsWith('4000')) {
      failureReason = 'Thẻ bị từ chối. Vui lòng dùng thẻ khác.';
    }
    const failed = failureReason !== null;
    if (body.method === 'WALLET' && !failed) user.walletBalance -= order.total;
    const payment: Payment = {
      id: `pay-${paymentsByKey.size + 1}`,
      orderId: order.id,
      method: body.method,
      status: body.method === 'CASH' ? 'PENDING' : failed ? 'FAILED' : 'SUCCESS',
      failureReason,
    };
    order.payments = [payment, ...(order.payments ?? [])];
    if (body.method !== 'CASH') order.status = failed ? 'CANCELLED' : 'PAID';
    if (key) paymentsByKey.set(key, payment);
    return failed ? paymentFailed(payment) : HttpResponse.json(payment, { status: 201 });
  }),

  http.get(`${API_URL}/orders`, ({ request }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json(orders.filter((o) => o.customer?.email === user.email).reverse());
  }),

  http.get(`${API_URL}/orders/all`, ({ request }) => {
    return requireRole(request, ['STAFF', 'MANAGER']) ?? HttpResponse.json([...orders].reverse());
  }),

  http.get(`${API_URL}/orders/:id`, ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized();
    const order = orders.find((o) => o.id === params.id);
    return order ? HttpResponse.json(order) : notFound('Không tìm thấy đơn');
  }),

  http.post(`${API_URL}/orders/:id/cancel`, ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized();
    const order = orders.find((o) => o.id === params.id);
    if (!order) return notFound('Không tìm thấy đơn');
    if (order.status !== 'PENDING_PAYMENT' && order.status !== 'PAID') {
      return conflict('Chỉ hủy được đơn chưa bắt đầu pha chế');
    }
    order.status = 'CANCELLED';
    for (const payment of order.payments ?? []) {
      if (payment.status === 'SUCCESS') payment.status = 'REFUNDED';
      if (payment.status === 'PENDING') payment.status = 'FAILED';
    }
    return HttpResponse.json(order, { status: 201 });
  }),

  http.post(`${API_URL}/orders/:id/confirm-cash`, ({ request, params }) => {
    const denied = requireRole(request, ['STAFF', 'MANAGER']);
    if (denied) return denied;
    const order = orders.find((o) => o.id === params.id);
    if (!order) return notFound('Không tìm thấy đơn');
    const cash = order.payments?.find((p) => p.method === 'CASH' && p.status === 'PENDING');
    if (!cash || order.status !== 'PENDING_PAYMENT') return conflict('Đơn không còn chờ thu tiền');
    cash.status = 'SUCCESS';
    order.status = 'PAID';
    return HttpResponse.json(order, { status: 201 });
  }),

  http.patch(`${API_URL}/orders/:id/status`, async ({ request, params }) => {
    const denied = requireRole(request, ['STAFF', 'MANAGER']);
    if (denied) return denied;
    const order = orders.find((o) => o.id === params.id);
    if (!order) return notFound('Không tìm thấy đơn');
    const { status } = (await request.json()) as { status: OrderStatus };
    if (NEXT_STATUS[order.status] !== status) return conflict('Không thể chuyển trạng thái này');
    order.status = status;
    return HttpResponse.json(order);
  }),

  // ---- Quản lý ----
  http.get(`${API_URL}/admin/products`, ({ request }) => {
    return requireRole(request, ['MANAGER']) ?? HttpResponse.json(adminProducts);
  }),

  http.post(`${API_URL}/admin/products`, async ({ request }) => {
    const denied = requireRole(request, ['MANAGER']);
    if (denied) return denied;
    const body = (await request.json()) as Omit<AdminProduct, 'id'>;
    const product: AdminProduct = {
      ...body,
      id: `p-new-${adminProducts.length + 1}`,
      sizes: body.sizes.map((s, i) => ({ ...s, id: `size-new-${i}` })),
    };
    adminProducts.push(product);
    return HttpResponse.json(product, { status: 201 });
  }),

  http.patch(`${API_URL}/admin/products/:id`, async ({ request, params }) => {
    const denied = requireRole(request, ['MANAGER']);
    if (denied) return denied;
    const product = adminProducts.find((p) => p.id === params.id);
    if (!product) return notFound('Không tìm thấy sản phẩm');
    Object.assign(product, await request.json());
    return HttpResponse.json(product);
  }),

  http.post(`${API_URL}/admin/products/:id/stock`, async ({ request, params }) => {
    const denied = requireRole(request, ['MANAGER']);
    if (denied) return denied;
    const product = adminProducts.find((p) => p.id === params.id);
    if (!product) return notFound('Không tìm thấy sản phẩm');
    const { delta } = (await request.json()) as { delta: number };
    if (product.stock + delta < 0) {
      return HttpResponse.json(
        { statusCode: 400, message: `Tồn kho chỉ còn ${product.stock}` },
        { status: 400 },
      );
    }
    product.stock += delta;
    return HttpResponse.json(product, { status: 201 });
  }),

  http.get(`${API_URL}/admin/toppings`, ({ request }) => {
    return requireRole(request, ['MANAGER']) ?? HttpResponse.json(adminToppings);
  }),

  http.post(`${API_URL}/admin/toppings`, async ({ request }) => {
    const denied = requireRole(request, ['MANAGER']);
    if (denied) return denied;
    const body = (await request.json()) as Omit<AdminTopping, 'id'>;
    const topping = { ...body, id: `top-new-${adminToppings.length + 1}` };
    adminToppings.push(topping);
    return HttpResponse.json(topping, { status: 201 });
  }),

  http.patch(`${API_URL}/admin/toppings/:id`, async ({ request, params }) => {
    const denied = requireRole(request, ['MANAGER']);
    if (denied) return denied;
    const topping = adminToppings.find((t) => t.id === params.id);
    if (!topping) return notFound('Không tìm thấy topping');
    Object.assign(topping, await request.json());
    return HttpResponse.json(topping);
  }),

  http.get(`${API_URL}/admin/reports/revenue`, ({ request }) => {
    const denied = requireRole(request, ['MANAGER']);
    if (denied) return denied;
    const days = Number(new URL(request.url).searchParams.get('days') ?? 7);
    const paid = orders.filter((o) => o.status !== 'PENDING_PAYMENT' && o.status !== 'CANCELLED');
    const revenue = paid.reduce((sum, o) => sum + o.total, 0);
    const today = Date.now();
    const report: RevenueReport = {
      days,
      revenue,
      orderCount: paid.length,
      averageOrder: paid.length ? Math.round(revenue / paid.length) : 0,
      daily: Array.from({ length: days }, (_, i) => ({
        date: new Date(today - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10),
        revenue: i === days - 1 ? revenue : 0,
        orders: i === days - 1 ? paid.length : 0,
      })),
      topProducts: [],
    };
    return HttpResponse.json(report);
  }),
];
