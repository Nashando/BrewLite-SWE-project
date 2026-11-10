import type { Topping } from '@/types';

export type CartTopping = Pick<Topping, 'id' | 'name' | 'price'>;

/**
 * Một dòng trong giỏ. Lưu ảnh chụp (snapshot) tên và giá lúc thêm để giỏ hiển thị đúng khi tải lại.
 * Giá chỉ để hiển thị: backend phải tính lại giá khi tạo đơn.
 */
export interface CartItem {
  lineId: string;
  productId: string;
  name: string;
  category: string;
  imageUrl?: string | null;
  sizeId: string | null;
  sizeName: string | null;
  toppings: CartTopping[];
  unitPrice: number;
  quantity: number;
}
