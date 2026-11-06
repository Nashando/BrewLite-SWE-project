import { calcUnitPrice } from './pricing';

describe('calcUnitPrice', () => {
  it('chỉ có giá gốc', () => expect(calcUnitPrice(25000, 0, [])).toBe(25000));
  it('cộng size và topping', () => expect(calcUnitPrice(40000, 5000, [7000, 5000])).toBe(57000));
});
