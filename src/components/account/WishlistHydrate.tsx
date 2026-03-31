'use client';

import { useEffect } from 'react';
import { useWishlistStore } from '@/store/wishlist.store';

export function WishlistHydrate({ productIds }: { productIds: string[] }) {
  const setProductIds = useWishlistStore((s) => s.setProductIds);
  useEffect(() => {
    setProductIds(productIds);
  }, [productIds, setProductIds]);
  return null;
}
