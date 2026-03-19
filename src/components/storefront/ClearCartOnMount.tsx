'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart.store';

/** Clears the cart when mounted (e.g. on order confirmation page). */
export function ClearCartOnMount() {
  const setItems = useCartStore((s) => s.setItems);
  useEffect(() => {
    setItems([]);
  }, [setItems]);
  return null;
}
