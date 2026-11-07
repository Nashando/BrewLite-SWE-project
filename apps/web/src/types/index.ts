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
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

// ---- Orders & payments (giả định hợp đồng API, cần chốt với backend) ----
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
}

export type PaymentMethod = 'WALLET' | 'CARD';

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: 'SUCCESS' | 'FAILED';
  failureReason?: string | null;
}
