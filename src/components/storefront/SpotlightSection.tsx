'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import type { Product, Store, Category } from '@prisma/client';
import { formatPrice, getFirstProductImage } from '@/lib/utils';
import { useDisplaySettings } from '@/context/display-settings';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

export function SpotlightSection({ product }: { product: ProductWithRelations | null }) {
  const { currencySymbol } = useDisplaySettings();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const p = 1 - Math.max(0, Math.min(1, r.top / vh));
        const s = 0.95 + p * 0.05;
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

  if (!product) return null;

  const img = getFirstProductImage(product.images);
  const price = Number(product.price);
  const compare = product.comparePrice != null ? Number(product.comparePrice) : null;

  const savePercent = compare && compare > price ? Math.round((1 - price / compare) * 100) : 0;
  const desc = useMemo(() => {
    const raw = (product.description ?? '').toString().replace(/\s+/g, ' ').trim();
    if (!raw) return 'Hand-picked limited collab energy—once it’s gone, it’s gone.';
    return raw.length > 180 ? `${raw.slice(0, 180)}…` : raw;
  }, [product.description]);

  return (
    <section
      ref={sectionRef}
      data-reveal
      className="relative overflow-hidden"
      style={{
        minHeight: '100vh',
        background: '#050e2a',
        transformOrigin: 'center center',
        transition: 'transform 0.12s linear',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(29,110,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(29,110,255,0.08) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.4,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, rgba(29,110,255,.15) 0%, transparent 70%)',
          animation: 'spotGlow 4s ease-in-out infinite',
        }}
      />

      <div className="relative z-[2] max-w-[1300px] mx-auto px-6 md:px-10 lg:px-12 py-[100px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div data-reveal-child>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--cyan)] inline-flex items-center gap-3">
            <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
            Vendor Pick of the Week
          </p>
          <h2 className="mt-5 font-display font-black leading-[1.0]" style={{ fontSize: 'clamp(48px,5.5vw,80px)', letterSpacing: '-2px' }}>
            THE<br />
            <span className="insync-gradient-text">DROP</span>
            <br />
            EVERYONE<br />
            WANTS.
          </h2>
          <p className="mt-6 font-sans text-[15px] font-light leading-[1.9]" style={{ color: 'var(--muted)' }}>
            {desc}
          </p>

          <div className="mt-8 flex items-end gap-6">
            <div className="font-display font-black insync-gradient-text" style={{ fontSize: 56, lineHeight: 1 }}>
              {formatPrice(price, currencySymbol)}
            </div>
            {compare && compare > price && (
              <div>
                <div className="text-[16px] line-through" style={{ color: 'rgba(238,242,255,0.55)' }}>
                  {formatPrice(compare, currencySymbol)}
                </div>
                {savePercent > 0 && (
                  <div
                    className="mt-2 inline-flex items-center rounded-[6px] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{
                      background: 'linear-gradient(135deg, var(--blue), var(--blue-mid))',
                      color: '#fff',
                    }}
                  >
                    {savePercent}% off
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={`/product/${product.slug}`} data-cursor="interactive" className="btn btn-primary">
              Add to Cart →
            </Link>
            <Link
              href={`/product/${product.slug}`}
              data-cursor="interactive"
              className="btn btn-ghost"
              style={{ borderColor: 'rgba(29,110,255,0.3)', color: 'var(--white)' }}
            >
              View Details
            </Link>
          </div>
        </div>

        <div data-reveal-child className="flex items-center justify-center relative">
          <div
            className="absolute rounded-full border"
            style={{
              width: 480,
              height: 480,
              borderColor: 'rgba(29,110,255,.15)',
              animation: 'spotRing 18s linear infinite',
            }}
          />
          <div
            className="absolute rounded-full border"
            style={{
              width: 360,
              height: 360,
              borderColor: 'rgba(0,200,255,.08)',
              animation: 'spotRing 12s linear infinite reverse',
            }}
          />

          <div
            className="relative rounded-[20px] overflow-hidden flex items-center justify-center"
            style={{
              width: 320,
              height: 380,
              background: 'linear-gradient(145deg, var(--blue-mid), var(--blue), #0060dd)',
              boxShadow: '24px 24px 0 rgba(5,14,42,1), 0 0 80px rgba(29,110,255,.4)',
              animation: 'spotBob 5s ease-in-out infinite',
            }}
          >
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt="" className="w-full h-full object-cover opacity-[0.92]" />
            ) : (
              <div className="text-[120px]">🧥</div>
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent, rgba(2,10,24,0.35))' }} />
          </div>

          <div
            className="insync-spot-tag-left absolute rounded-[8px] px-4 py-3 border"
            style={{
              top: 20,
              left: -20,
              transform: 'rotate(-3deg)',
              background: 'var(--bg2)',
              borderColor: 'rgba(29,110,255,0.15)',
              color: 'rgba(238,242,255,0.65)',
              backdropFilter: 'blur(12px)',
            }}
          >
            Limited — {product.store.name}
          </div>

          <div
            className="insync-spot-tag-right absolute rounded-[8px] px-4 py-3 border"
            style={{
              bottom: 40,
              right: -30,
              transform: 'rotate(2deg)',
              background: 'rgba(29,110,255,.15)',
              borderColor: 'rgba(29,110,255,0.15)',
              color: 'var(--cyan)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {product.category.name}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spotGlow {
          0%,
          100% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }
        @keyframes spotRing {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spotBob {
          0%,
          100% {
            transform: rotate(-2deg) translateY(0);
          }
          50% {
            transform: rotate(1deg) translateY(-18px);
          }
        }
        @media (max-width: 640px) {
          .insync-spot-tag-left {
            left: 12px !important;
            top: 12px !important;
            transform: rotate(-2deg) !important;
          }
          .insync-spot-tag-right {
            right: 12px !important;
            bottom: 12px !important;
            transform: rotate(1deg) !important;
          }
        }
      `}</style>
    </section>
  );
}

