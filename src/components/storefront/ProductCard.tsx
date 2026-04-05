'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { useToast } from '@/hooks/use-toast';
import { addToCartDb } from '@/actions/cart.actions';
import { addToWishlist } from '@/actions/user.actions';
import { useSession } from 'next-auth/react';
import { useDisplaySettings } from '@/context/display-settings';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
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
  /** default → cozy → compact → slim (shortest image area) */
  density?: 'default' | 'cozy' | 'compact' | 'slim';
  /** Match landing bento glass tokens (`insync-storefront-glass`). */
  storefrontGlass?: boolean;
  /** Home: animated blue border shine (`insync-landing-product-shine`). */
  landingShine?: boolean;
  /** Shop grid: full-bleed image, gradient copy, tilt, floating cart on hover */
  shopVisual?: boolean;
}

export function ProductCard({
  product,
  variant = 'default',
  density = 'default',
  storefrontGlass = false,
  landingShine = false,
  shopVisual = false,
}: ProductCardProps) {
  const router = useRouter();
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
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    if (status === 'authenticated' && !hydrated) hydrate();
  }, [status, hydrated, hydrate]);

  const handleAddToCart = (e: React.MouseEvent) => {
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

  const handleShopTiltMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: py * -9, ry: px * 11 });
  };

  const handleShopTiltLeave = () => setTilt({ rx: 0, ry: 0 });

  const aspectClass =
    variant === 'official'
      ? 'aspect-[2/3]'
      : density === 'slim'
        ? 'aspect-[5/6]'
        : density === 'compact'
          ? 'aspect-[4/5]'
          : density === 'cozy'
            ? 'aspect-[7/9]'
            : 'aspect-[3/4]';

  const quickBtn =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[rgba(2,10,24,0.8)] backdrop-blur-[8px] text-[var(--muted)] transition-all duration-[250ms] ease-out hover:border-[var(--cyan)] hover:text-[var(--cyan)]';

  const surfaceClass = storefrontGlass
    ? 'insync-storefront-glass hover:border-[rgba(255,255,255,0.22)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(29,110,255,0.14)]'
    : 'border border-[var(--border)] bg-[var(--card-bg)] backdrop-blur-[20px] hover:border-[rgba(29,110,255,0.35)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(29,110,255,0.1),0_0_40px_rgba(29,110,255,0.12)]';

  const shopQuick =
    'flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[rgba(4,12,28,0.72)] text-[var(--white)] shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-[10px] transition-all duration-200 ease-out hover:border-[var(--cyan)]/50 hover:bg-[rgba(29,110,255,0.25)] hover:text-[var(--cyan)]';

  if (shopVisual) {
    return (
      <Link
        href={`/product/${product.slug}`}
        data-cursor-hover
        onMouseMove={handleShopTiltMove}
        onMouseLeave={handleShopTiltLeave}
        className="group relative block cursor-pointer rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:shadow-[0_28px_64px_rgba(0,0,0,0.45),0_0_48px_rgba(29,110,255,0.12)]"
      >
        <div
          className="overflow-hidden rounded-[28px] border border-white/10 transition-transform duration-100 ease-out will-change-transform"
          style={{
            transform: `perspective(880px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          }}
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px]">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt={product.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
              />
            ) : (
              <div className="h-full w-full bg-[rgba(6,18,50,0.9)]" />
            )}

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent"
              aria-hidden
            />

            <div className="absolute left-0 top-0 z-[15] flex max-w-[70%] flex-col gap-1.5 p-3">
              {product.store.isOfficial && (
                <span
                  className="w-fit border border-[var(--border)] bg-[rgba(29,110,255,0.2)] px-2.5 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--cyan)] backdrop-blur-[8px]"
                  style={{ borderRadius: '6px 0 6px 0' }}
                >
                  Official
                </span>
              )}
              {product.isFeatured && (
                <span
                  className="w-fit border border-white/35 bg-gradient-to-br from-[var(--blue)] via-[#2a7cff] to-[var(--blue-mid)] px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_0_14px_rgba(29,110,255,0.6)] backdrop-blur-[6px]"
                  style={{ borderRadius: '6px 0 6px 0' }}
                >
                  Featured
                </span>
              )}
            </div>

            {savePercent > 0 && (
              <span className="absolute bottom-[5.75rem] left-3 z-10 rounded-md bg-gradient-to-br from-[var(--blue)] to-[var(--blue-mid)] px-2 py-0.5 font-sans text-[10px] font-semibold text-white shadow-[0_0_12px_rgba(29,110,255,0.45)]">
                -{savePercent}%
              </span>
            )}

            <button
              type="button"
              aria-label={inWishlist ? 'In wishlist' : 'Add to wishlist'}
              className={`absolute right-3 top-3 z-20 ${shopQuick} ${
                inWishlist
                  ? 'scale-100 opacity-100'
                  : 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100'
              }`}
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
                className={`h-4 w-4 ${inWishlist ? 'fill-[var(--cyan)] text-[var(--cyan)]' : ''}`}
                strokeWidth={1.5}
                fill={inWishlist ? 'currentColor' : 'none'}
              />
            </button>

            <button
              type="button"
              aria-label="Add to cart"
              onClick={handleAddToCart}
              className={`absolute right-3 top-14 z-20 ${shopQuick} translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100`}
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] space-y-1 px-4 pb-4 pt-20">
              <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--cyan)]">
                {product.store.name}
              </p>
              <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-[var(--white)]">
                {product.title}
              </h3>
              <p className="font-sans text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
                {product.category.name}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="font-display text-[18px] font-bold text-[var(--white)]">
                  {formatPrice(price, symbol)}
                </span>
                {comparePrice != null && comparePrice > price && (
                  <span className="font-sans text-[12px] text-[var(--muted)] line-through">
                    {formatPrice(comparePrice, symbol)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      data-cursor-hover
      className={`group relative block cursor-pointer overflow-hidden rounded-2xl transition-[transform,box-shadow,border-color] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:scale-[1.01] ${surfaceClass} ${
        landingShine ? 'insync-landing-product-shine' : ''
      } ${variant === 'official' ? 'min-w-[260px] flex-shrink-0' : ''}`}
    >
      <div className={`relative overflow-hidden ${aspectClass}`}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
          />
        ) : (
          <div className="h-full w-full bg-[rgba(6,18,50,0.9)]" />
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent opacity-90"
          style={{ background: 'linear-gradient(to top, var(--card-bg) 0%, transparent 40%)' }}
          aria-hidden
        />

        <div className="absolute left-0 top-0 z-[15] flex flex-col gap-1.5 p-3">
          {product.store.isOfficial && (
            <span
              className="border border-[var(--border)] bg-[rgba(29,110,255,0.15)] px-3 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--cyan)] backdrop-blur-[8px]"
              style={{ borderRadius: '6px 0 6px 0' }}
            >
              Official
            </span>
          )}
          {product.isFeatured && (
            <span
              className="border border-white/35 bg-gradient-to-br from-[var(--blue)] via-[#2a7cff] to-[var(--blue-mid)] px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_16px_rgba(29,110,255,0.75),0_2px_10px_rgba(0,0,0,0.45)] backdrop-blur-[6px]"
              style={{ borderRadius: '6px 0 6px 0' }}
            >
              Featured
            </span>
          )}
        </div>

        {savePercent > 0 && (
          <span className="absolute bottom-12 left-3 z-10 rounded-md bg-gradient-to-br from-[var(--blue)] to-[var(--blue-mid)] px-2.5 py-0.5 font-sans text-[10px] font-semibold text-white shadow-[0_0_10px_rgba(29,110,255,0.4)]">
            -{savePercent}%
          </span>
        )}

        <button
          type="button"
          aria-label={inWishlist ? 'In wishlist' : 'Add to wishlist'}
          className={`absolute right-3 top-3 z-10 ${quickBtn} ${
            inWishlist
              ? 'scale-100 opacity-100'
              : 'scale-[0.8] opacity-0 group-hover:scale-100 group-hover:opacity-100'
          }`}
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
            className={`h-4 w-4 ${inWishlist ? 'fill-[var(--cyan)] text-[var(--cyan)]' : ''}`}
            strokeWidth={1.5}
            fill={inWishlist ? 'currentColor' : 'none'}
          />
        </button>

        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
          <button
            type="button"
            aria-label="Quick view"
            className={`pointer-events-auto ${quickBtn} scale-[0.8] opacity-0 transition-all duration-[250ms] ease-out group-hover:scale-100 group-hover:opacity-100`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/product/${product.slug}`);
            }}
          >
            <Eye className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-[8] translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full border-0 bg-gradient-to-br from-[var(--blue)] to-[var(--blue-mid)] py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_0_20px_rgba(29,110,255,0.4)] transition-opacity duration-200 hover:opacity-95"
            style={{ borderRadius: '0 0 14px 14px' }}
          >
            Add to cart
          </button>
        </div>
      </div>

      <div
        className="p-4"
        style={{
          paddingLeft: density === 'slim' || density === 'compact' ? 13 : density === 'cozy' ? 15 : 16,
          paddingRight: density === 'slim' || density === 'compact' ? 13 : density === 'cozy' ? 15 : 16,
          paddingBottom: density === 'slim' || density === 'compact' ? 13 : density === 'cozy' ? 15 : 16,
          paddingTop: density === 'slim' || density === 'compact' ? 11 : density === 'cozy' ? 13 : 14,
        }}
      >
        <p
          className="mb-1 font-sans text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--cyan)]"
        >
          {product.store.name}
        </p>
        <h3 className="mb-1.5 line-clamp-2 font-display text-[14px] font-semibold leading-snug text-[var(--white)]">
          {product.title}
        </h3>
        <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
          {product.category.name}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-[20px] font-bold text-[var(--white)]">
            {formatPrice(price, symbol)}
          </span>
          {comparePrice != null && comparePrice > price && (
            <span className="font-sans text-[13px] text-[var(--muted)] line-through">
              {formatPrice(comparePrice, symbol)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
