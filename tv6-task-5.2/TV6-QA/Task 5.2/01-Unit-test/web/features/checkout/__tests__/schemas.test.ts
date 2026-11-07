import { describe, expect, it } from 'vitest';
import { cardSchema, isExpired } from '../schemas';
import { createIdempotencyKey } from '../utils/idempotency';

describe('isExpired', () => {
  const now = new Date(2026, 9, 31); // 31/10/2026

  it('thẻ còn hạn đến hết tháng ghi trên thẻ', () => {
    expect(isExpired('10/26', now)).toBe(false);
    expect(isExpired('11/26', now)).toBe(false);
    expect(isExpired('01/30', now)).toBe(false);
  });

  it('thẻ hết hạn từ tháng trước', () => {
    expect(isExpired('09/26', now)).toBe(true);
    expect(isExpired('12/25', now)).toBe(true);
  });

  it('định dạng sai coi như không hợp lệ', () => {
    expect(isExpired('13/30', now)).toBe(true);
    expect(isExpired('1/30', now)).toBe(true);
    expect(isExpired('abc', now)).toBe(true);
  });
});

describe('cardSchema', () => {
  const valid = { number: '4242 4242 4242 4242', expiry: '12/40', cvv: '123' };

  it('chấp nhận thẻ hợp lệ, có hoặc không có khoảng trắng', () => {
    expect(cardSchema.safeParse(valid).success).toBe(true);
    expect(cardSchema.safeParse({ ...valid, number: '4242424242424242' }).success).toBe(true);
  });

  it.each([
    [{ number: '1234' }, 'Số thẻ gồm 16 chữ số'],
    [{ number: '4242 4242 4242 42ab' }, 'Số thẻ gồm 16 chữ số'],
    [{ expiry: '1240' }, 'Nhập hạn dùng dạng MM/YY'],
    [{ expiry: '01/20' }, 'Thẻ đã hết hạn'],
    [{ cvv: '12' }, 'CVV gồm 3 hoặc 4 chữ số'],
  ])('từ chối %j', (override, message) => {
    const result = cardSchema.safeParse({ ...valid, ...override });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.message)).toContain(message);
  });
});

describe('createIdempotencyKey', () => {
  it('mỗi lần sinh ra một khóa khác nhau', () => {
    const keys = new Set(Array.from({ length: 20 }, createIdempotencyKey));

    expect(keys.size).toBe(20);
    expect([...keys].every((k) => k.length >= 10)).toBe(true);
  });
});
