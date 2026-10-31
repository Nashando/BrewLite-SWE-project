import { describe, expect, it } from 'vitest';
import { calculateUnitPrice } from '../utils/calculatePrice';

describe('calculateUnitPrice', () => {
  it('chỉ có giá gốc khi không chọn size và topping', () => {
    expect(calculateUnitPrice(35000, null, [])).toBe(35000);
    expect(calculateUnitPrice(35000, undefined, [])).toBe(35000);
  });

  it('cộng phụ thu size', () => {
    expect(calculateUnitPrice(35000, { extraPrice: 12000 }, [])).toBe(47000);
  });

  it('cộng tất cả topping đã chọn', () => {
    const toppings = [{ price: 10000 }, { price: 7000 }];
    expect(calculateUnitPrice(35000, { extraPrice: 6000 }, toppings)).toBe(58000);
  });
});
