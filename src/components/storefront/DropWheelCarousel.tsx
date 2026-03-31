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

export function DropWheelCarousel({ products }: { products: ProductWithRelations[] }) {
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

  const items = useMemo(() => products.slice(0, 7), [products]);

  return (
    <section
      ref={sectionRef}
      data-reveal
      className="relative overflow-hidden border-t border-b"
      style={{
        padding: '120px 0',
        background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%)',
        borderColor: 'rgba(29,110,255,0.15)',
        transformOrigin: 'center center',
        transition: 'transform 0.12s linear',
      }}
    >
      <div data-reveal-child className="max-w-[900px] mx-auto text-center px-6 md:px-10 lg:px-12">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)] inline-flex items-center gap-3 justify-center">
          <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
          Rotating Collection
        </p>
        <h2 className="mt-4 font-display font-extrabold leading-[1.05]" style={{ fontSize: 'clamp(34px, 4.8vw, 62px)', letterSpacing: '-1.6px' }}>
          SPIN THE<br />
          <span className="insync-gradient-text italic">DROP WHEEL</span>
        </h2>
      </div>

      <div data-reveal-child className="mt-16">
        <div className="relative h-[420px]" style={{ perspective: 1100 }}>
          <div
            className="insync-c3d-stage absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              animation: 'insyncC3DSpin 16s linear infinite',
            }}
          >
            {items.map((p, i) => {
              const angle = (360 / Math.max(1, items.length)) * i;
              const img = getFirstProductImage(p.images);
              return (
                <div
                  key={p.id}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: 220,
                    height: 310,
                    marginLeft: -110,
                    marginTop: -155,
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${angle}deg) translateZ(370px)`,
                  }}
                >
                  <Link
                    href={`/product/${p.slug}`}
                    data-cursor="interactive"
                    className="block w-full h-full rounded-[14px] p-[18px] border"
                    style={{
                      background: 'rgba(6,18,50,0.7)',
                      borderColor: 'rgba(29,110,255,0.15)',
                      backdropFilter: 'blur(16px)',
                      transition: 'border-color .3s, box-shadow .3s',
                    }}
                  >
                    <div
                      className="rounded-[10px] border flex items-center justify-center overflow-hidden"
                      style={{
                        height: 190,
                        background: 'rgba(29,110,255,.04)',
                        borderColor: 'rgba(29,110,255,.06)',
                      }}
                    >
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[68px]">🛍️</div>
                      )}
                    </div>
                    <div className="mt-4 font-sans text-[8px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--cyan)' }}>
                      {p.store.name}
                    </div>
                    <div className="mt-1 font-display text-[12px] font-semibold leading-[1.3]" style={{ color: 'var(--white)' }}>
                      {p.title}
                    </div>
                    <div className="mt-2 font-display text-[18px] font-extrabold insync-gradient-text">
                      {formatPrice(Number(p.price), currencySymbol)}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center mt-10 font-sans text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>
          {items.length} products rotating
        </p>
      </div>

      <style jsx global>{`
        @keyframes insyncC3DSpin {
          to {
            transform: rotateY(-360deg);
          }
        }
      `}</style>
    </section>
  );
}

