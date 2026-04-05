'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Product, Store, Category } from '@prisma/client';
import { Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useDisplaySettings } from '@/context/display-settings';
import { formatPrice, getFirstProductImage } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';
import { addToCartDb } from '@/actions/cart.actions';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { SectionReveal } from '@/components/motion/SectionReveal';
import { RevealItem } from '@/components/motion/RevealItem';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

interface OfficialPicksScrollProps {
  products: ProductWithRelations[];
}

function FlipCard({ product }: { product: ProductWithRelations }) {
  const { currencySymbol } = useDisplaySettings();
  const img = getFirstProductImage(product.images);
  const price = Number(product.price);
  const { addItem, openCart } = useCartStore();
  const { toast } = useToast();
  const { status } = useSession();

  const shortDesc = useMemo(() => {
    const raw = (product.description ?? '').toString().replace(/\s+/g, ' ').trim();
    if (!raw) return 'Curated official pick—built for standout moments.';
    return raw.length > 110 ? `${raw.slice(0, 110)}…` : raw;
  }, [product.description]);

  const handleAdd = async (e: React.MouseEvent) => {
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
    if (status === 'authenticated') await addToCartDb(product.id, 1);
    openCart();
    toast({ title: 'Added to cart', variant: 'success' });
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      data-cursor="interactive"
      className="group relative block insync-landing-product-shine rounded-[16px]"
      style={{ perspective: 1100 }}
    >
      <div
        className="insync-flip-inner relative w-full h-[380px] rounded-[16px] transition-transform duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-[16px] overflow-hidden border"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(145deg, #030f2e, #071e50)',
            borderColor: 'rgba(29,110,255,0.15)',
          }}
        >
          <div className="absolute inset-0">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover opacity-[0.85]"
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
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 30% 10%, rgba(0,200,255,0.16), transparent 55%), linear-gradient(to top, rgba(2,10,24,0.88), rgba(2,10,24,0.2) 55%, rgba(2,10,24,0.25))',
              }}
            />
          </div>

          <div className="relative z-[2] p-5 h-full flex flex-col justify-end">
            <div className="font-sans text-[9px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--cyan)' }}>
              {product.store.name}
            </div>
            <div className="mt-1 font-display text-[14px] font-semibold leading-[1.35]" style={{ color: 'var(--white)' }}>
              {product.title}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="font-display text-[20px] font-extrabold insync-gradient-text">
                {formatPrice(price, currencySymbol)}
              </div>
              <div className="font-sans text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(238,242,255,0.55)' }}>
                hover to flip
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-[16px] overflow-hidden border"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(145deg, var(--blue), var(--blue-mid))',
            borderColor: 'rgba(29,110,255,0.15)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.22, background: 'radial-gradient(circle at 30% 10%, rgba(0,200,255,0.6), transparent 60%)' }} />
          <div className="relative z-[2] p-6 h-full flex flex-col">
            <div className="font-display text-[18px] font-black leading-[1.15]" style={{ color: '#eef2ff', letterSpacing: '-0.6px' }}>
              {product.title}
            </div>
            <div className="mt-3 font-sans text-[13px] leading-[1.8]" style={{ color: 'rgba(238,242,255,0.85)' }}>
              {shortDesc}
            </div>
            <div className="mt-auto pt-5 flex items-end justify-between gap-4">
              <div className="font-display text-[24px] font-black" style={{ color: '#eef2ff' }}>
                {formatPrice(price, currencySymbol)}
              </div>
              <button
                type="button"
                onClick={handleAdd}
                data-cursor="interactive"
                className="rounded-[8px] px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] border"
                style={{
                  background: 'rgba(2,10,24,0.18)',
                  borderColor: 'rgba(238,242,255,0.28)',
                  color: '#eef2ff',
                  boxShadow: '0 0 26px rgba(0,200,255,0.12)',
                }}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hover flip trigger */}
      <style jsx>{`
        a.group:hover .insync-flip-inner {
          transform: rotateY(180deg);
        }
      `}</style>
    </Link>
  );
}

export function OfficialPicksScroll({ products }: OfficialPicksScrollProps) {
  const scaleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scaleRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const progress = 1 - Math.min(1, Math.max(0, rect.top / vh));
        const s = 0.95 + progress * 0.05;
        el.style.transform = `scale(${s})`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <SectionReveal
      stagger
      className="relative overflow-hidden border-t px-6 pt-12 pb-14 md:px-10 md:pt-14 md:pb-16 lg:px-12 lg:pt-16 lg:pb-20"
      style={{
        borderColor: 'rgba(29,110,255,0.15)',
        background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg2) 45%, var(--bg) 100%)',
      }}
    >
      {/* Grid texture overlay + pulsing glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(29,110,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(29,110,255,0.08) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.65,
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(29,110,255,0.18), transparent 62%)',
          filter: 'blur(10px)',
          animation: 'insyncFloat 4s ease-in-out infinite',
        }}
      />

      <div ref={scaleRef} className="origin-center transition-transform duration-100 ease-linear">
      <RevealItem className="relative z-[2] mb-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)] inline-flex items-center gap-3">
            <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
            Curated
          </p>
          <h2 className="mt-3 font-display font-extrabold leading-[1.05]" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', letterSpacing: '-1.6px' }}>
            Official <span className="insync-gradient-text italic">Picks</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="inline-flex items-center gap-2 rounded-full border py-2 px-4 font-sans text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{
              background: 'rgba(29,110,255,0.06)',
              borderColor: 'rgba(29,110,255,0.2)',
              color: 'var(--cyan)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <Crown className="w-4 h-4" />
            INSYNC Official
          </span>

          {/* Sort / filter controls (UI only; data unchanged) */}
          <div className="hidden md:flex items-center gap-2">
            {['Popular', 'New', 'Price'].map((label) => (
              <button
                key={label}
                type="button"
                data-cursor="interactive"
                className="rounded-full px-4 py-2 border font-sans text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  background: 'rgba(6,18,50,0.55)',
                  borderColor: 'rgba(29,110,255,0.18)',
                  color: 'rgba(238,242,255,0.78)',
                  backdropFilter: 'blur(18px)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <Link
            href="/shop?featured=1"
            data-cursor="interactive"
            className="inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-[rgba(238,242,255,0.72)] hover:text-[var(--white)] transition-colors duration-150"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </RevealItem>

      <RevealItem className="relative z-[2] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <FlipCard key={product.id} product={product} />
        ))}
      </RevealItem>
      </div>
    </SectionReveal>
  );
}
