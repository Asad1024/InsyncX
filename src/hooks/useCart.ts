'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart.store';
import { getDbCart, syncCartToDb } from '@/actions/cart.actions';

export function useCart() {
  const { data: session, status } = useSession();
  const { items, setItems } = useCartStore();

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;

    const run = async () => {
      const dbItems = await getDbCart(session.user.id);
      if (dbItems.length > 0) {
        setItems(dbItems);
      } else if (items.length > 0) {
        await syncCartToDb(
          session.user.id,
          items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
        );
      }
    };
    run();
  }, [status, session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
}
