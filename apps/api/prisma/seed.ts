import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const sizes = [
  { name: 'Tall', extraPrice: 0 },
  { name: 'Grande', extraPrice: 6000 },
  { name: 'Venti', extraPrice: 12000 },
];

const toppings = [
  { name: 'Trân châu đen', price: 7000 },
  { name: 'Thạch dừa', price: 5000 },
  { name: 'Kem cheese', price: 10000 },
  { name: 'Pudding trứng', price: 8000 },
];

const products = [
  { name: 'Cà phê sữa đá', category: 'Cà phê', basePrice: 25000, stock: 100, withSizes: true, description: 'Cà phê phin truyền thống pha sữa đặc.' },
  { name: 'Bạc xỉu', category: 'Cà phê', basePrice: 29000, stock: 100, withSizes: true, description: 'Nhiều sữa, ít cà phê, vị ngọt béo.' },
  { name: 'Cà phê muối', category: 'Cà phê', basePrice: 32000, stock: 80, withSizes: true, description: 'Cà phê với lớp kem muối mặn nhẹ.' },
  { name: 'Trà đào cam sả', category: 'Trà', basePrice: 39000, stock: 80, withSizes: true, description: 'Trà đào, cam tươi và sả thơm.' },
  { name: 'Trà vải', category: 'Trà', basePrice: 35000, stock: 80, withSizes: true, description: 'Trà hoa hồng kết hợp vải thiều.' },
  { name: 'Trà sữa trân châu', category: 'Trà', basePrice: 40000, stock: 120, withSizes: true, description: 'Trà sữa đậm vị kèm trân châu đen.' },
  { name: 'Matcha latte', category: 'Trà', basePrice: 45000, stock: 60, withSizes: true, description: 'Bột matcha Nhật pha sữa tươi.' },
  { name: 'Cookie & Cream Freeze', category: 'Freeze', basePrice: 55000, stock: 60, withSizes: true, description: 'Đá xay cookie, kem tươi và sốt sô-cô-la.' },
  { name: 'Matcha Freeze', category: 'Freeze', basePrice: 55000, stock: 60, withSizes: true, description: 'Matcha đá xay mát lạnh phủ kem.' },
  { name: 'Bánh croissant', category: 'Bánh', basePrice: 30000, stock: 40, withSizes: false, description: 'Bánh sừng bò bơ nướng giòn.' },
];

async function main() {
  await prisma.user.upsert({
    where: { email: 'manager@brewlite.vn' },
    update: {},
    create: { email: 'manager@brewlite.vn', name: 'Quản lý', role: Role.MANAGER, password: await bcrypt.hash('Manager@123', 10) },
  });
  await prisma.user.upsert({
    where: { email: 'staff@brewlite.vn' },
    update: {},
    create: { email: 'staff@brewlite.vn', name: 'Nhân viên pha chế', role: Role.STAFF, password: await bcrypt.hash('Staff@123', 10) },
  });
  await prisma.user.upsert({
    where: { email: 'khach@brewlite.vn' },
    update: {},
    create: { email: 'khach@brewlite.vn', name: 'Khách Demo', password: await bcrypt.hash('Customer@123', 10) },
  });

  for (const t of toppings) {
    await prisma.topping.upsert({ where: { name: t.name }, update: { price: t.price }, create: t });
  }

  for (const { withSizes, ...p } of products) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: { basePrice: p.basePrice, description: p.description, category: p.category },
      create: { ...p, ...(withSizes ? { sizes: { create: sizes } } : {}) },
    });
  }
  console.log('Seed xong: 3 user, %d topping, %d sản phẩm', toppings.length, products.length);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
