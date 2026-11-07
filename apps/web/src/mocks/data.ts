import type { Product, ProductDetail, ProductSize, Topping } from '@/types';

export const mockProducts: Product[] = [
  { id: 'p-01', name: 'Cà phê sữa đá', description: 'Robusta rang đậm, sữa đặc, nhiều đá.', category: 'Cà phê', basePrice: 35000, isAvailable: true },
  { id: 'p-02', name: 'Bạc xỉu', description: 'Nhiều sữa, ít cà phê, vị ngọt dịu.', category: 'Cà phê', basePrice: 39000, isAvailable: true },
  { id: 'p-03', name: 'Cold brew cam', description: 'Cà phê ủ lạnh 16 giờ, thêm lát cam tươi.', category: 'Cà phê', basePrice: 55000, isAvailable: true },
  { id: 'p-04', name: 'Cà phê muối', description: 'Lớp kem muối béo mặn phủ trên cà phê sữa.', category: 'Cà phê', basePrice: 45000, isAvailable: true },
  { id: 'p-05', name: 'Trà đào cam sả', description: 'Trà đen, đào miếng, cam vắt và sả đập.', category: 'Trà', basePrice: 49000, isAvailable: true },
  { id: 'p-06', name: 'Trà vải hoa hồng', description: 'Trà lài, vải ngâm và cánh hoa hồng sấy.', category: 'Trà', basePrice: 52000, isAvailable: true },
  { id: 'p-07', name: 'Trà sen vàng', description: 'Trà ướp sen, hạt sen và kem cheese.', category: 'Trà', basePrice: 49000, isAvailable: false },
  { id: 'p-08', name: 'Matcha đá xay', description: 'Matcha Nhật xay cùng sữa tươi, phủ kem.', category: 'Đá xay', basePrice: 59000, isAvailable: true },
  { id: 'p-09', name: 'Cacao đá xay', description: 'Cacao đậm, sữa tươi và đá xay mịn.', category: 'Đá xay', basePrice: 55000, isAvailable: true },
  { id: 'p-10', name: 'Bánh croissant bơ', description: 'Nướng mỗi sáng, vỏ giòn, ruột nhiều lớp.', category: 'Bánh', basePrice: 39000, isAvailable: true },
  { id: 'p-11', name: 'Bánh flan caramel', description: 'Flan mềm, caramel đắng nhẹ.', category: 'Bánh', basePrice: 25000, isAvailable: true },
];

const drinkSizes: ProductSize[] = [
  { id: 'size-s', name: 'Nhỏ', extraPrice: 0 },
  { id: 'size-m', name: 'Vừa', extraPrice: 6000 },
  { id: 'size-l', name: 'Lớn', extraPrice: 12000 },
];

const boba: Topping = { id: 'top-boba', name: 'Trân châu đen', price: 8000 };
const coconutJelly: Topping = { id: 'top-coconut-jelly', name: 'Thạch dừa', price: 7000 };

const toppingsByCategory: Record<string, Topping[]> = {
  'Cà phê': [
    { id: 'top-shot', name: 'Thêm shot espresso', price: 10000 },
    { id: 'top-cheese', name: 'Kem cheese', price: 10000 },
    { id: 'top-coffee-jelly', name: 'Thạch cà phê', price: 7000 },
  ],
  Trà: [boba, coconutJelly, { id: 'top-chia', name: 'Hạt chia', price: 5000 }],
  'Đá xay': [boba, { id: 'top-cream', name: 'Kem whipping', price: 8000 }, coconutJelly],
};

/** Dữ liệu cho GET /products/:id: bánh không có size và topping. */
export const mockProductDetails: ProductDetail[] = mockProducts.map((p) => ({
  ...p,
  sizes: p.category === 'Bánh' ? [] : drinkSizes,
  toppings: toppingsByCategory[p.category] ?? [],
}));
