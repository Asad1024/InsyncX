import { create } from 'zustand';
import { getWishlistProductIds } from '@/actions/user.actions';

interface WishlistState {
  productIds: string[];
  hydrated: boolean;
  setProductIds: (ids: string[]) => void;
  addProductId: (id: string) => void;
  removeProductId: (id: string) => void;
  hydrate: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  hydrated: false,
  setProductIds: (ids) => set({ productIds: ids, hydrated: true }),
  addProductId: (id) =>
    set((state) =>
      state.productIds.includes(id) ? state : { productIds: [...state.productIds, id] }
    ),
  removeProductId: (id) =>
    set((state) => ({
      productIds: state.productIds.filter((pid) => pid !== id),
    })),
  hydrate: async () => {
    const ids = await getWishlistProductIds();
    set({ productIds: ids, hydrated: true });
  },
  isInWishlist: (productId) => get().productIds.includes(productId),
}));
