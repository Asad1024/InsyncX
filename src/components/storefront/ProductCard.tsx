'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { useToast } from '@/hooks/use-toast';
import { addToCartDb } from '@/actions/cart.actions';
import { addToWishlist } from '@/actions/user.actions';
import { useSession } from 'next-auth/react';
import { useDisplaySettings } from '@/context/display-settings';
import { Heart } from 'lucide-react';
import { formatPrice, getFirstProductImage } from '@/lib/utils';
import type { Product, Store, Category } from '@prisma/client';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

interface ProductCardProps {
  product: ProductWithRelations;
  variant?: 'default' | 'official';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { currencySymbol: symbol } = useDisplaySettings();
  const img = getFirstProductImage(product.images);
  const price = Number(product.price);
  const comparePrice = product.comparePrice != null ? Number(product.comparePrice) : null;
  const { addItem, openCart } = useCartStore();
  const { toast } = useToast();
  const { status } = useSession();
  const { isInWishlist, hydrate, addProductId, hydrated } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const savePercent = comparePrice != null && comparePrice > price ? Math.round((1 - price / comparePrice) * 100) : 0;

  useEffect(() => {
    if (status === 'authenticated' && !hydrated) hydrate();
  }, [status, hydrated, hydrate]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      quantity: 1,
      title: product.title,
      price,
      image: img ?? undefined,
      slug: product.slug,
      storeName: product.store.name,
      storeSlug: product.store.slug,
    });
    if (status === 'authenticated') addToCartDb(product.id, 1);
    openCart();
    toast({ title: 'Added to cart', variant: 'success' });
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`block group rounded-[14px] overflow-hidden bg-[var(--surface)] border cursor-pointer relative transition-all duration-[0.25s] ease-out hover:border-[var(--line-md)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] ${variant === 'official' ? 'min-w-[260px] flex-shrink-0' : ''}`}
      style={{ borderColor: 'var(--line)' }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: variant === 'official' ? '2/3' : '3/4',
          background: 'var(--surface3)',
        }}
      >
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full bg-[var(--surface3)]" />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {product.store.isOfficial && (
            <span
              className="font-sans text-[9px] font-bold uppercase tracking-[0.08em] py-[3px] px-2 rounded-full"
              style={{ background: 'var(--gold)', color: '#000' }}
            >
              Official
            </span>
          )}
          {product.isFeatured && !product.store.isOfficial && (
            <span
              className="font-sans text-[9px] font-semibold uppercase tracking-[0.08em] py-[3px] px-2 rounded-full border"
              style={{
                background: 'var(--surface3)',
                color: 'var(--text-2)',
                borderColor: 'var(--line-md)',
              }}
            >
              Featured
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          aria-label={inWishlist ? 'In wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 hover:scale-110 ${inWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{
            background: 'rgba(9,9,11,0.75)',
            backdropFilter: 'blur(8px)',
            borderColor: inWishlist ? 'var(--line-gold)' : 'var(--line-md)',
          }}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (status !== 'authenticated') {
              toast({ title: 'Sign in to add to wishlist', variant: 'default' });
              return;
            }
            const res = await addToWishlist(product.id);
            if (res?.error) {
              toast({ title: res.error, variant: 'default' });
              return;
            }
            addProductId(product.id);
            toast({ title: 'Added to wishlist', variant: 'success' });
          }}
        >
          <Heart
            className={`w-3.5 h-3.5 ${inWishlist ? 'fill-[var(--gold)] text-[var(--gold)]' : 'text-[var(--text-3)]'}`}
            strokeWidth={1.5}
            fill={inWishlist ? 'currentColor' : 'none'}
          />
        </button>

        {/* Quick Add overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{
            background: 'rgba(9,9,11,0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full py-2.5 rounded-lg border-none cursor-pointer font-sans text-[11px] font-semibold uppercase tracking-[0.06em] transition-[background] duration-150 hover:bg-[var(--gold-dim)]"
            style={{ background: 'var(--gold)', color: '#000' }}
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="p-3.5 pt-3.5 pb-4" style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 16 }}>
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--gold)] mb-1">
          {product.category.name}
        </p>
        <h3 className="font-display text-[17px] font-normal text-[var(--text)] leading-[1.3] mb-1.5 line-clamp-2">
          {product.title}
        </h3>
        <p className="font-sans text-[12px] text-[var(--text-3)] mb-2.5">
          {product.store.name}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-sans text-[14px] font-semibold text-[var(--text)]">
            {formatPrice(price, symbol)}
          </span>
          {comparePrice != null && comparePrice > price && (
            <span className="font-sans text-[13px] text-[var(--text-4)] line-through">
              {formatPrice(comparePrice, symbol)}
            </span>
          )}
          {savePercent > 0 && (
            <span
              className="font-sans text-[10px] font-semibold py-0.5 px-1.5 rounded-full"
              style={{ background: 'rgba(34,197,94,0.10)', color: '#22c55e' }}
            >
              -{savePercent}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
