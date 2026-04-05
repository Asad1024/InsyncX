'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Heart } from 'lucide-react';
import { SectionReveal } from '@/components/motion/SectionReveal';
import { RevealItem } from '@/components/motion/RevealItem';
import { useSession } from 'next-auth/react';
import { getLatestProducts } from '@/actions/product.actions';
import { addToCartDb } from '@/actions/cart.actions';
import { addToWishlist } from '@/actions/user.actions';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { useToast } from '@/hooks/use-toast';
import { useDisplaySettings } from '@/context/display-settings';
import { formatPrice, getFirstProductImage } from '@/lib/utils';
import type { Product, Store, Category } from '@prisma/client';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

interface LatestFromStoresProps {
  products: ProductWithRelations[];
}

function firstTag(tags: unknown): string | null {
  if (!Array.isArray(tags)) return null;
  const x = tags.find((t) => typeof t === 'string' && t.trim());
  return typeof x === 'string' ? x : null;
}

function badgeLabel(p: ProductWithRelations): string {
  return firstTag(p.tags) ?? p.category.name ?? 'Shop';
}

type BadgeVariant = 'sale' | 'new' | 'featured' | 'default';

function getBadgeVariant(p: ProductWithRelations): BadgeVariant {
  const price = Number(p.price);
  const cp = p.comparePrice != null ? Number(p.comparePrice) : null;
  if (cp != null && cp > price) return 'sale';
  if (p.isNewArrival) return 'new';
  if (p.isFeatured) return 'featured';
  return 'default';
}

const badgeVariantStyles: Record<BadgeVariant, CSSProperties> = {
  featured: {
    background: 'rgba(29,110,255,0.2)',
    borderColor: 'rgba(29,110,255,0.4)',
    color: '#00c8ff',
  },
  sale: {
    background: 'rgba(255,50,50,0.15)',
    borderColor: 'rgba(255,80,80,0.3)',
    color: '#ff8080',
  },
  new: {
    background: 'rgba(0,200,100,0.12)',
    borderColor: 'rgba(0,200,100,0.3)',
    color: '#00e676',
  },
  default: {
    background: 'rgba(6,18,50,0.8)',
    borderColor: 'rgba(29,110,255,0.15)',
    color: '#00c8ff',
  },
};

function padNine(slice: ProductWithRelations[]): (ProductWithRelations | null)[] {
  const out: (ProductWithRelations | null)[] = [...slice];
  while (out.length < 9) out.push(null);
  return out.slice(0, 9);
}

function EditorialChunk({
  nine,
  globalOffset,
  sectionInView,
}: {
  nine: (ProductWithRelations | null)[];
  globalOffset: number;
  sectionInView: boolean;
}) {
  const [p0, p1, p2, p3, p4, p5, p6, p7, p8] = nine;

  return (
    <div className="mt-[14px] flex flex-col gap-[14px] first:mt-0">
      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-[14px] min-[641px]:grid-cols-2 lg:grid-cols-3">
        {p0 && (
          <PortraitCard
            product={p0}
            globalIndex={globalOffset + 0}
            sectionInView={sectionInView}
            featuredCenter={false}
            rowClass="h-[380px] lg:h-[480px]"
          />
        )}
        {p1 && (
          <PortraitCard
            product={p1}
            globalIndex={globalOffset + 1}
            sectionInView={sectionInView}
            featuredCenter
            rowClass="h-[380px] lg:h-[480px]"
          />
        )}
        {p2 && (
          <div className="min-[641px]:max-lg:hidden">
            <PortraitCard
              product={p2}
              globalIndex={globalOffset + 2}
              sectionInView={sectionInView}
              featuredCenter={false}
              rowClass="h-[380px] lg:h-[480px]"
            />
          </div>
        )}
      </div>

      {/* Row 2 */}
      {(p3 || p4) && (
        <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-[1.6fr_1fr]">
          {p3 && (
            <LandscapeCard
              product={p3}
              globalIndex={globalOffset + 3}
              sectionInView={sectionInView}
              rowClass="h-[380px]"
            />
          )}
          {p4 && (
            <PortraitCard
              product={p4}
              globalIndex={globalOffset + 4}
              sectionInView={sectionInView}
              featuredCenter={false}
              rowClass="h-[380px]"
            />
          )}
        </div>
      )}

      {/* Row 3 */}
      {(p5 || p6 || p7 || p8) && (
        <div className="grid grid-cols-1 gap-[14px] min-[641px]:grid-cols-2 lg:grid-cols-4">
          {p5 && (
            <PortraitCard
              product={p5}
              globalIndex={globalOffset + 5}
              sectionInView={sectionInView}
              featuredCenter={false}
              rowClass="h-[380px] lg:h-[320px]"
            />
          )}
          {p6 && (
            <PortraitCard
              product={p6}
              globalIndex={globalOffset + 6}
              sectionInView={sectionInView}
              featuredCenter={false}
              rowClass="h-[380px] lg:h-[320px]"
            />
          )}
          {p7 && (
            <PortraitCard
              product={p7}
              globalIndex={globalOffset + 7}
              sectionInView={sectionInView}
              featuredCenter={false}
              rowClass="h-[380px] lg:h-[320px]"
            />
          )}
          {p8 && (
            <PortraitCard
              product={p8}
              globalIndex={globalOffset + 8}
              sectionInView={sectionInView}
              featuredCenter={false}
              rowClass="h-[380px] lg:h-[320px]"
            />
          )}
        </div>
      )}
    </div>
  );
}

function PortraitCard({
  product,
  globalIndex,
  sectionInView,
  featuredCenter,
  rowClass,
}: {
  product: ProductWithRelations;
  globalIndex: number;
  sectionInView: boolean;
  featuredCenter: boolean;
  rowClass: string;
}) {
  const router = useRouter();
  const { currencySymbol } = useDisplaySettings();
  const { toast } = useToast();
  const { status } = useSession();
  const { addItem, openCart } = useCartStore();
  const { isInWishlist, hydrate, addProductId, hydrated } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const img = getFirstProductImage(product.images);
  const price = Number(product.price);
  const comparePrice = product.comparePrice != null ? Number(product.comparePrice) : null;
  const hasDiscount = comparePrice != null && comparePrice > price;
  const savePercent = hasDiscount ? Math.round((1 - price / comparePrice!) * 100) : 0;
  const variant = getBadgeVariant(product);
  const bStyle = badgeVariantStyles[variant];
  const delayMs = globalIndex * 80;

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

  const handleWishlist = async (e: React.MouseEvent) => {
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
  };

  const goProduct = () => router.push(`/product/${product.slug}`);

  const revealClass = sectionInView
    ? 'opacity-100 translate-y-0 scale-100'
    : 'opacity-0 translate-y-7 scale-[0.98]';

  return (
    <div
      className={`${rowClass} transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${revealClass}`}
      style={{ transitionDelay: sectionInView ? `${delayMs}ms` : '0ms' }}
    >
    <Link
      href={`/product/${product.slug}`}
      data-cursor-hover
      className="insync-landing-product-shine latest-stores-card-group group relative block h-full overflow-hidden rounded-[18px] border border-[rgba(29,110,255,0.15)] transition-[border-color,transform,box-shadow] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:scale-[1.01] hover:border-[rgba(29,110,255,0.4)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(29,110,255,0.15)]"
    >
      {featuredCenter && <div className="latest-stores-featured-ring" aria-hidden />}

      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
          style={{ objectPosition: 'center top' }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(29,110,255,0.14), rgba(0,200,255,0.06))',
          }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to top, rgba(2,10,24,0.95) 0%, rgba(2,10,24,0.4) 45%, rgba(2,10,24,0.05) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(29,110,255,0.2) 0%, transparent 60%)',
        }}
      />

      {featuredCenter && (
        <div className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100">
          <button
            type="button"
            data-cursor-hover
            className="pointer-events-auto translate-y-2.5 border border-[rgba(29,110,255,0.15)] bg-[rgba(6,18,50,0.85)] px-7 py-3 font-sans text-[11px] font-semibold uppercase tracking-[1.5px] text-[#eef2ff] backdrop-blur-[16px] transition-[transform,border-color,color] duration-[350ms] ease-out group-hover:translate-y-0 hover:border-[#00c8ff] hover:text-[#00c8ff]"
            style={{ borderRadius: 100 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goProduct();
            }}
          >
            Quick view
          </button>
        </div>
      )}

      <span
        className="absolute left-4 top-4 z-[4] border px-3.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[2px] backdrop-blur-[12px]"
        style={{ ...bStyle, borderRadius: 100, zIndex: 4 }}
      >
        {hasDiscount ? `-${savePercent}%` : badgeLabel(product)}
      </span>

      <button
        type="button"
        data-cursor-hover
        aria-label={inWishlist ? 'In wishlist' : 'Add to wishlist'}
        className={`absolute right-4 top-4 z-[4] flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(29,110,255,0.15)] bg-[rgba(6,18,50,0.7)] transition-[opacity,transform] duration-300 hover:border-[#00c8ff] ${
          inWishlist ? 'scale-100 opacity-100' : 'scale-[0.7] opacity-0 group-hover:scale-100 group-hover:opacity-100'
        }`}
        onClick={handleWishlist}
      >
        <Heart
          className={`h-4 w-4 ${inWishlist ? 'fill-[#00c8ff] text-[#00c8ff]' : 'text-[#eef2ff]'}`}
          strokeWidth={1.5}
          fill={inWishlist ? 'currentColor' : 'none'}
        />
      </button>

      <div className="absolute bottom-0 left-0 right-0 z-[3] px-[22px] pb-6 pt-0">
        <p
          className="mb-1 font-sans text-[9px] font-semibold uppercase tracking-[2.5px]"
          style={{ color: '#00c8ff' }}
        >
          {product.store.name}
        </p>
        <span
          className="mb-2 inline-block border border-[rgba(29,110,255,0.15)] bg-[rgba(29,110,255,0.12)] px-3 py-0.5 font-sans text-[9px] font-normal uppercase tracking-[1.5px] text-[rgba(238,242,255,0.38)]"
          style={{ borderRadius: 100 }}
        >
          {product.category.name}
        </span>
        <h3 className="mb-2.5 line-clamp-2 font-display text-[15px] font-bold leading-snug text-[#eef2ff]">
          {product.title}
        </h3>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className="font-display text-[22px] font-bold"
              style={{
                background: 'linear-gradient(90deg, #eef2ff, #00c8ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {formatPrice(price, currencySymbol)}
            </span>
            {hasDiscount && (
              <span className="font-sans text-[13px] text-[rgba(238,242,255,0.38)] line-through">
                {formatPrice(comparePrice!, currencySymbol)}
              </span>
            )}
            {hasDiscount && (
              <span
                className="border border-[rgba(255,80,80,0.3)] bg-[rgba(255,50,50,0.2)] px-2.5 py-0.5 font-sans text-[10px] font-semibold text-[#ff8080]"
                style={{ borderRadius: 6 }}
              >
                -{savePercent}%
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          data-cursor-hover
          onClick={handleAddToCart}
          className="translate-y-2 border-0 bg-gradient-to-br from-[#1d6eff] to-[#0047cc] px-5 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-white opacity-0 shadow-[0_0_16px_rgba(29,110,255,0.4)] transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          style={{ borderRadius: 8 }}
        >
          Add to cart
        </button>
      </div>
    </Link>
    </div>
  );
}

function LandscapeCard({
  product,
  globalIndex,
  sectionInView,
  rowClass,
}: {
  product: ProductWithRelations;
  globalIndex: number;
  sectionInView: boolean;
  rowClass: string;
}) {
  const router = useRouter();
  const { currencySymbol } = useDisplaySettings();
  const { toast } = useToast();
  const { status } = useSession();
  const { isInWishlist, hydrate, addProductId, hydrated } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const img = getFirstProductImage(product.images);
  const price = Number(product.price);
  const comparePrice = product.comparePrice != null ? Number(product.comparePrice) : null;
  const hasDiscount = comparePrice != null && comparePrice > price;
  const savePercent = hasDiscount ? Math.round((1 - price / comparePrice!) * 100) : 0;
  const variant = getBadgeVariant(product);
  const bStyle = badgeVariantStyles[variant];
  const delayMs = globalIndex * 80;

  useEffect(() => {
    if (status === 'authenticated' && !hydrated) hydrate();
  }, [status, hydrated, hydrate]);

  const handleWishlist = async (e: React.MouseEvent) => {
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
  };

  const revealClass = sectionInView
    ? 'opacity-100 translate-y-0 scale-100'
    : 'opacity-0 translate-y-7 scale-[0.98]';

  return (
    <div
      className={`${rowClass} transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${revealClass}`}
      style={{ transitionDelay: sectionInView ? `${delayMs}ms` : '0ms' }}
    >
    <div className="insync-landing-product-shine latest-stores-card-group group relative h-full overflow-hidden rounded-[18px] border border-[rgba(29,110,255,0.15)] transition-[border-color,transform,box-shadow] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:scale-[1.01] hover:border-[rgba(29,110,255,0.4)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(29,110,255,0.15)]">
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
          style={{ objectPosition: 'center top' }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(29,110,255,0.14), rgba(0,200,255,0.06))',
          }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to right, rgba(2,10,24,0.96) 0%, rgba(2,10,24,0.6) 40%, rgba(2,10,24,0.1) 70%, transparent 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(29,110,255,0.2) 0%, transparent 60%)',
        }}
      />

      <span
        className="absolute left-4 top-4 z-[4] border px-3.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[2px] backdrop-blur-[12px]"
        style={{ ...bStyle, borderRadius: 100, zIndex: 4 }}
      >
        {hasDiscount ? `-${savePercent}%` : badgeLabel(product)}
      </span>

      <button
        type="button"
        data-cursor-hover
        aria-label={inWishlist ? 'In wishlist' : 'Add to wishlist'}
        className={`absolute right-4 top-4 z-[4] flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(29,110,255,0.15)] bg-[rgba(6,18,50,0.7)] transition-[opacity,transform] duration-300 hover:border-[#00c8ff] ${
          inWishlist ? 'scale-100 opacity-100' : 'scale-[0.7] opacity-0 group-hover:scale-100 group-hover:opacity-100'
        }`}
        onClick={handleWishlist}
      >
        <Heart
          className={`h-4 w-4 ${inWishlist ? 'fill-[#00c8ff] text-[#00c8ff]' : 'text-[#eef2ff]'}`}
          strokeWidth={1.5}
          fill={inWishlist ? 'currentColor' : 'none'}
        />
      </button>

      <div className="absolute bottom-0 left-0 top-0 z-[3] flex max-w-[55%] flex-col justify-end p-9">
        <p
          className="mb-1 font-sans text-[9px] font-semibold uppercase tracking-[2.5px]"
          style={{ color: '#00c8ff' }}
        >
          {product.store.name}
        </p>
        <span
          className="mb-2 inline-block w-fit border border-[rgba(29,110,255,0.15)] bg-[rgba(29,110,255,0.12)] px-3 py-0.5 font-sans text-[9px] font-normal uppercase tracking-[1.5px] text-[rgba(238,242,255,0.38)]"
          style={{ borderRadius: 100 }}
        >
          {product.category.name}
        </span>
        <h3 className="mb-2.5 line-clamp-2 font-display text-[22px] font-bold leading-snug text-[#eef2ff]">
          {product.title}
        </h3>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className="font-display text-[28px] font-bold"
            style={{
              background: 'linear-gradient(90deg, #eef2ff, #00c8ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {formatPrice(price, currencySymbol)}
          </span>
          {hasDiscount && (
            <span className="font-sans text-[13px] text-[rgba(238,242,255,0.38)] line-through">
              {formatPrice(comparePrice!, currencySymbol)}
            </span>
          )}
          {hasDiscount && (
            <span
              className="border border-[rgba(255,80,80,0.3)] bg-[rgba(255,50,50,0.2)] px-2.5 py-0.5 font-sans text-[10px] font-semibold text-[#ff8080]"
              style={{ borderRadius: 6 }}
            >
              -{savePercent}%
            </span>
          )}
        </div>
        <button
          type="button"
          data-cursor-hover
          className="group/vp mt-5 inline-flex w-fit items-center gap-2 border border-[rgba(238,242,255,0.2)] bg-transparent px-[22px] py-[11px] font-sans text-[11px] font-semibold uppercase tracking-wide text-[#eef2ff] transition-[border-color,color] duration-200 hover:border-[#00c8ff] hover:text-[#00c8ff]"
          style={{ borderRadius: 8 }}
          onClick={() => router.push(`/product/${product.slug}`)}
        >
          View product
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/vp:translate-x-1" />
        </button>
      </div>
    </div>
    </div>
  );
}

export function LatestFromStores({ products: initialProducts }: LatestFromStoresProps) {
  const [products, setProducts] = useState<ProductWithRelations[]>(initialProducts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length === 9);
  const sectionRef = useRef<HTMLElement>(null);
  const [sectionInView, setSectionInView] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
    setHasMore(initialProducts.length === 9);
  }, [initialProducts]);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setSectionInView(true);
        });
      },
      { threshold: 0.08 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [products.length]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = await getLatestProducts(9, products.length);
      if (next.length > 0) {
        setProducts((prev) => [...prev, ...next]);
        setHasMore(next.length === 9);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  if (products.length === 0) return null;

  const chunks: (ProductWithRelations | null)[][] = [];
  for (let i = 0; i < products.length; i += 9) {
    chunks.push(padNine(products.slice(i, i + 9)));
  }

  return (
    <SectionReveal
      ref={sectionRef}
      stagger
      className="px-6 pb-10 pt-8 md:px-10 md:pb-12 md:pt-10 lg:px-12 lg:pb-14 lg:pt-12"
      style={{ background: 'var(--bg)' }}
    >
      <RevealItem>
        <div className="mx-auto mb-10 flex max-w-[1400px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="mb-3 flex items-center gap-3 font-sans text-[10px] font-semibold uppercase tracking-[4px]"
              style={{ color: '#00c8ff' }}
            >
              <span className="inline-block h-px w-7 shrink-0" style={{ background: '#00c8ff' }} />
              From vendors
            </p>
            <h2
              className="font-display font-extrabold leading-none tracking-[-2px]"
              style={{ fontSize: 'clamp(36px, 4.5vw, 60px)' }}
            >
              <span style={{ color: '#eef2ff' }}>From Our </span>
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(90deg, #1d6eff, #00c8ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Stores
              </span>
            </h2>
          </div>
          <Link
            href="/shop"
            data-cursor-hover
            className="group/va inline-flex items-center gap-1 self-start border-b border-[rgba(238,242,255,0.1)] pb-0.5 font-sans text-[11px] font-medium uppercase tracking-[2px] text-[rgba(238,242,255,0.38)] transition-[color,border-color] duration-200 hover:border-[#00c8ff] hover:text-[#00c8ff] sm:self-auto"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/va:translate-x-[5px]" />
          </Link>
        </div>
      </RevealItem>

      <RevealItem>
        <div className="mx-auto max-w-[1400px]">
          {chunks.map((nine, chunkIndex) => (
            <EditorialChunk
              key={chunkIndex}
              nine={nine}
              globalOffset={chunkIndex * 9}
              sectionInView={sectionInView}
            />
          ))}

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                data-cursor-hover
                disabled={loadingMore}
                onClick={loadMore}
                className="border border-[rgba(29,110,255,0.15)] bg-transparent px-12 py-[15px] font-sans text-[12px] font-semibold uppercase tracking-[2px] text-[#eef2ff] transition-[border-color,background-color,box-shadow,color] duration-300 hover:border-[#1d6eff] hover:bg-[rgba(29,110,255,0.06)] hover:text-[#00c8ff] hover:shadow-[0_0_24px_rgba(29,110,255,0.2)] disabled:opacity-50"
                style={{ borderRadius: 8 }}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </RevealItem>
    </SectionReveal>
  );
}
