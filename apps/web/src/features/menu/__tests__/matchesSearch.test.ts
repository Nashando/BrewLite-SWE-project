import { describe, expect, it } from 'vitest';
import { matchesSearch } from '../utils/matchesSearch';

const tea = { name: 'Trà đào cam sả' };

describe('matchesSearch', () => {
  it('ô trống hoặc chỉ có khoảng trắng thì khớp mọi món', () => {
    expect(matchesSearch(tea, '')).toBe(true);
    expect(matchesSearch(tea, '   ')).toBe(true);
  });

  it.each(['trà đào', 'TRA DAO', 'tra dao', 'cam sa', 'dao tra', 'tr', 'đ'])('tìm thấy với "%s"', (query) => {
    expect(matchesSearch(tea, query)).toBe(true);
  });

  it('không khớp thì trả false', () => {
    expect(matchesSearch(tea, 'cà phê')).toBe(false);
  });

  it('không tìm trong mô tả: "phê" không ra Bạc xỉu dù mô tả có "cà phê"', () => {
    const bacXiu = { name: 'Bạc xỉu', description: 'Nhiều sữa, ít cà phê, vị ngọt béo.' };
    expect(matchesSearch(bacXiu, 'phê')).toBe(false);
    expect(matchesSearch({ name: 'Cà phê muối' }, 'Phê')).toBe(true);
  });

  it('chỉ khớp từ đầu mỗi từ: "an" không khớp "Bánh", "cha" không khớp "Matcha"', () => {
    expect(matchesSearch({ name: 'Bánh croissant' }, 'an')).toBe(false);
    expect(matchesSearch({ name: 'Matcha latte' }, 'cha')).toBe(false);
    expect(matchesSearch({ name: 'Matcha latte' }, 'mat')).toBe(true);
  });

  it('phải khớp đủ mọi từ khóa', () => {
    expect(matchesSearch(tea, 'tra vai')).toBe(false);
  });
});
