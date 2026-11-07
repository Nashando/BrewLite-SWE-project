import { describe, expect, it } from 'vitest';
import { buildLineId } from '../utils/lineId';
import { calculateLineTotal, calculateTotal, countItems } from '../utils/calculateTotal';

describe('calculateTotal', () => {
  const items = [
    { unitPrice: 57000, quantity: 2 },
    { unitPrice: 39000, quantity: 1 },
  ];

  it('tính tổng một dòng', () => {
    expect(calculateLineTotal(items[0])).toBe(114000);
  });

  it('tính tổng giỏ hàng', () => {
    expect(calculateTotal(items)).toBe(153000);
  });

  it('giỏ rỗng có tổng 0', () => {
    expect(calculateTotal([])).toBe(0);
    expect(countItems([])).toBe(0);
  });

  it('đếm tổng số lượng', () => {
    expect(countItems(items)).toBe(3);
  });
});

describe('buildLineId', () => {
  it('không phụ thuộc thứ tự topping', () => {
    expect(buildLineId('p-01', 'size-l', ['b', 'a'])).toBe(buildLineId('p-01', 'size-l', ['a', 'b']));
  });

  it('khác size hoặc topping thì khác dòng', () => {
    expect(buildLineId('p-01', 'size-l', [])).not.toBe(buildLineId('p-01', 'size-m', []));
    expect(buildLineId('p-01', 'size-l', ['a'])).not.toBe(buildLineId('p-01', 'size-l', []));
  });

  it('hỗ trợ món không có size', () => {
    expect(buildLineId('p-10', null, [])).toBe('p-10|none');
  });
});
