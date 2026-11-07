import type { Product } from '@/types';

/** Bỏ dấu tiếng Việt để gõ "tra dao" vẫn tìm thấy "Trà đào". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();
}

const wordsOf = (text: string) => normalize(text).split(/\s+/).filter(Boolean);

/**
 * Chỉ tìm theo tên món, vì mô tả hay nhắc tới món khác ("Bạc xỉu: ít cà phê") nên dễ ra kết quả thừa.
 * Mỗi từ khóa phải khớp phần đầu của một từ trong tên, để "an" không khớp nhầm "Bánh".
 */
export function matchesSearch(product: Pick<Product, 'name'>, query: string): boolean {
  const keywords = wordsOf(query);
  const nameWords = wordsOf(product.name);
  return keywords.every((keyword) => nameWords.some((word) => word.startsWith(keyword)));
}
