import type { CartItem } from '../types';

type Priced = Pick<CartItem, 'unitPrice' | 'quantity'>;

export function calculateLineTotal(item: Priced): number {
  return item.unitPrice * item.quantity;
}

export function calculateTotal(items: Priced[]): number {
  return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
}

export function countItems(items: Pick<CartItem, 'quantity'>[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
