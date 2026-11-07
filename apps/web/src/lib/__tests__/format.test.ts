import { describe, expect, it } from 'vitest';
import { formatVND } from '../format';

describe('formatVND', () => {
  it('định dạng số nguyên theo kiểu Việt Nam', () => {
    expect(formatVND(45000)).toMatch(/^45\.000\s₫$/);
    expect(formatVND(1250000)).toMatch(/^1\.250\.000\s₫$/);
  });

  it('định dạng số 0', () => {
    expect(formatVND(0)).toMatch(/^0\s₫$/);
  });
});
