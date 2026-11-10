/** Khớp với response của GET /products. Giá là số nguyên VND. */
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl?: string | null;
  isAvailable: boolean;
}

/** Size của đồ uống. extraPrice là phụ thu cộng vào basePrice (0 nếu size mặc định). */
export interface ProductSize {
  id: string;
  name: string;
  extraPrice: number;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
}

/**
 * Khớp với response của GET /products/:id.
 * Giả định (cần chốt với backend): size và topping nằm trong object sản phẩm.
 * Món không có size (ví dụ bánh) trả về sizes: [].
 */
export interface ProductDetail extends Product {
  sizes: ProductSize[];
  toppings: Topping[];
}

// ---- Auth ----
export type Role = 'CUSTOMER' | 'STAFF' | 'MANAGER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  /** Phiên đăng nhập cũ có thể chưa có trường này, khi đó coi như khách. */
  role?: Role;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

// ---- Orders & payments ----
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItem {
  productName: string;
  sizeName: string | null;
  toppings: string[];
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
  /** Mới nhất đứng trước. */
  payments?: Payment[];
  /** Chỉ có ở danh sách của nhân viên. */
  customer?: { name: string; email: string };
}

export type PaymentMethod = 'WALLET' | 'CARD' | 'CASH';

/** PENDING: tiền mặt đang chờ thu tại quầy. */
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  failureReason?: string | null;
}

// ---- Quản lý ----
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl: string | null;
  stock: number;
  isActive: boolean;
  sizes: ProductSize[];
}

export interface AdminTopping extends Topping {
  isActive: boolean;
}

export interface RevenueReport {
  days: number;
  revenue: number;
  orderCount: number;
  averageOrder: number;
  daily: { date: string; revenue: number; orders: number }[];
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[];
}
