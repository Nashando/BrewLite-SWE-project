import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_QUANTITY } from '@/lib/constants';
import type { CartItem } from './types';
import { buildLineId } from './utils/lineId';

interface CartState {
  items: CartItem[];
  /** true sau khi đã đọc giỏ từ localStorage (tránh lệch HTML giữa server và client). */
  hydrated: boolean;
  addItem: (input: Omit<CartItem, 'lineId'>) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
}

const clampQuantity = (n: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.floor(n)));

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,

      addItem: (input) =>
        set((state) => {
          const lineId = buildLineId(
            input.productId,
            input.sizeId,
            input.toppings.map((t) => t.id),
          );
          const existing = state.items.find((i) => i.lineId === lineId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === lineId
                  ? { ...i, unitPrice: input.unitPrice, quantity: clampQuantity(i.quantity + input.quantity) }
                  : i,
              ),
            };
          }
          return {
            items: [...state.items, { ...input, lineId, quantity: clampQuantity(input.quantity) }],
          };
        }),

      setQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, quantity: clampQuantity(quantity) } : i,
          ),
        })),

      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'brewlite-cart',
      version: 1,
      // Hydrate thủ công trong Providers (useEffect) để HTML server và lần render đầu của client khớp nhau.
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => () => {
        useCartStore.setState({ hydrated: true });
      },
    },
  ),
);
