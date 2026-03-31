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
import type { Store, Category } from '@prisma/client';

/** Fields ProductCard reads — full Prisma `Product` rows satisfy this. */
export type ProductCardProduct = {
  id: string;
  title: string;
  slug: string;
  price: unknown;
  comparePrice?: unknown;
  images: unknown;
  isFeatured: boolean;
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

interface ProductCardProps {
  product: ProductCardProduct;
  variant?: 'default' | 'official';
  density?: 'default' | 'compact';
}

export function ProductCard({ product, variant = 'default', density = 'default' }: ProductCardProps) {
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
      data-cursor="interactive"
      className={`block group overflow-hidden cursor-pointer relative transition-all duration-300 ease-out hover:-translate-y-[10px] hover:scale-[1.01] ${
        variant === 'official' ? 'min-w-[260px] flex-shrink-0' : ''
      }`}
      style={{
        borderRadius: 16,
        background: 'rgba(6,18,50,0.7)',
        border: '1px solid rgba(29,110,255,0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute -top-10 -right-10 w-[240px] h-[240px] rounded-full pointer-events-none opacity-80 transition-transform duration-300 group-hover:scale-[1.22]"
        style={{
          background: 'radial-gradient(circle, rgba(29,110,255,0.4), transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: variant === 'official' ? '2/3' : density === 'compact' ? '4/5' : '3/4',
          background: 'linear-gradient(135deg, rgba(29,110,255,0.08), rgba(0,200,255,0.04))',
        }}
      >
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full" style={{ background: 'rgba(6,18,50,0.9)' }} />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {product.store.isOfficial && (
            <span
              className="font-sans text-[9px] font-bold uppercase tracking-[0.08em] py-[3px] px-2 rounded-full"
              style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-mid))', color: '#fff', boxShadow: '0 0 18px rgba(29,110,255,0.35)' }}
            >
              Official
            </span>
          )}
          {product.isFeatured && !product.store.isOfficial && (
            <span
              className="font-sans text-[9px] font-semibold uppercase tracking-[0.08em] py-[3px] px-2 rounded-full border"
              style={{
                background: 'rgba(29,110,255,0.10)',
                color: 'rgba(238,242,255,0.9)',
                borderColor: 'rgba(29,110,255,0.2)',
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
            background: 'rgba(6,18,50,0.65)',
            backdropFilter: 'blur(14px)',
            borderColor: inWishlist ? 'rgba(0,200,255,0.45)' : 'rgba(29,110,255,0.22)',
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
            className={`w-3.5 h-3.5 ${inWishlist ? 'fill-[var(--cyan)] text-[var(--cyan)]' : 'text-[rgba(238,242,255,0.55)]'}`}
            strokeWidth={1.5}
            fill={inWishlist ? 'currentColor' : 'none'}
          />
        </button>

        {/* Quick Add overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{
            background: 'rgba(2,10,24,0.72)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full py-2.5 rounded-[8px] border-none cursor-pointer font-sans text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{
              background: 'linear-gradient(135deg, var(--blue), var(--blue-mid))',
              boxShadow: '0 0 22px rgba(29,110,255,0.35)',
              color: '#fff',
            }}
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Product info */}
      <div
        className="p-3.5 pt-3.5 pb-4"
        style={{
          paddingLeft: density === 'compact' ? 14 : 16,
          paddingRight: density === 'compact' ? 14 : 16,
          paddingBottom: density === 'compact' ? 14 : 16,
          paddingTop: density === 'compact' ? 12 : 14,
        }}
      >
        <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.22em] mb-1" style={{ color: 'var(--cyan)' }}>
          {product.store.name}
        </p>
        <h3 className="font-display text-[13px] font-semibold text-[var(--text)] leading-[1.35] mb-2">
          {product.title}
        </h3>
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="text-[11px] font-sans uppercase tracking-[0.18em]" style={{ color: 'rgba(238,242,255,0.55)' }}>
            {product.category.name}
          </div>
          {savePercent > 0 && (
            <span
              className="font-sans text-[10px] font-semibold py-0.5 px-2 rounded-full border"
              style={{ background: 'rgba(29,110,255,0.12)', color: 'var(--cyan)', borderColor: 'rgba(29,110,255,0.22)' }}
            >
              -{savePercent}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-[20px] font-bold text-[var(--white)]" style={{ letterSpacing: '-0.5px' }}>
            {formatPrice(price, symbol)}
          </span>
          {comparePrice != null && comparePrice > price && (
            <span className="font-sans text-[13px] text-[var(--text-4)] line-through">
              {formatPrice(comparePrice, symbol)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
