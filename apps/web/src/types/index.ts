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
