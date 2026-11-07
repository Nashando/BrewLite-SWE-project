import { describe, expect, it } from 'vitest';
import { matchesSearch } from '../utils/matchesSearch';

const tea = { name: 'Trà đào cam sả', description: 'Trà đen, đào miếng' };

describe('matchesSearch', () => {
  it('ô trống hoặc chỉ có khoảng trắng thì khớp mọi món', () => {
    expect(matchesSearch(tea, '')).toBe(true);
    expect(matchesSearch(tea, '   ')).toBe(true);
  });

  it.each(['trà đào', 'TRA DAO', 'tra dao', 'cam sa', 'miếng'])('tìm thấy với "%s"', (query) => {
    expect(matchesSearch(tea, query)).toBe(true);
  });

  it('không khớp thì trả false', () => {
    expect(matchesSearch(tea, 'cà phê')).toBe(false);
  });
});
