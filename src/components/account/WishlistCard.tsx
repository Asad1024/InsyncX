'use client';

import { useTransition } from 'react';
import { X } from 'lucide-react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { removeFromWishlist } from '@/actions/user.actions';
import { useWishlistStore } from '@/store/wishlist.store';
import type { Product, Store, Category } from '@prisma/client';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

interface WishlistCardProps {
  product: ProductWithRelations;
  userId: string;
}

export function WishlistCard({ product, userId }: WishlistCardProps) {
  const [pending, startTransition] = useTransition();
  const removeProductId = useWishlistStore((s) => s.removeProductId);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(() => {
      removeFromWishlist(userId, product.id);
      removeProductId(product.id);
    });
  };

  return (
    <div className="relative group">
      <div
        className="absolute right-3 top-3 z-30 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-colors duration-150 hover:bg-[rgba(239,68,68,0.12)] hover:text-[var(--red)]"
        style={{
          background: 'rgba(9,9,11,0.8)',
          borderColor: 'var(--line)',
          color: 'var(--text-3)',
        }}
        onClick={handleRemove}
        onKeyDown={(e) => e.key === 'Enter' && handleRemove(e as unknown as React.MouseEvent)}
        role="button"
        tabIndex={0}
        aria-label="Remove from wishlist"
        aria-busy={pending}
      >
        {pending ? (
          <span className="w-3.5 h-3.5 border-2 border-[var(--text-3)] border-t-transparent rounded-full animate-spin block" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
      </div>
      <ProductCard product={product} shopVisual />
    </div>
  );
}
