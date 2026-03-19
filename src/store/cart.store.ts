import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartLine {
  productId: string;
  quantity: number;
  title?: string;
  price?: number;
  image?: string;
  slug?: string;
}

interface CartState {
  items: CartLine[];
  isOpen: boolean;
  setItems: (items: CartLine[]) => void;
  addItem: (line: CartLine) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setItems: (items) => set({ items }),
      addItem: (line) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === line.productId);
          const items = existing
            ? state.items.map((i) =>
                i.productId === line.productId
                  ? { ...i, quantity: i.quantity + line.quantity }
                  : i
              )
            : [...state.items, line];
          return { items };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      getCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((acc, i) => acc + (i.price ?? 0) * i.quantity, 0),
    }),
    { name: 'insyncx-cart' }
  )
);
