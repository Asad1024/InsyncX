'use client';

import Link from 'next/link';
import { ProductCard } from './ProductCard';
import type { Product, Store, Category } from '@prisma/client';
import { ArrowRight } from 'lucide-react';
import { useDisplaySettings } from '@/context/display-settings';
import { formatPrice, getFirstProductImage } from '@/lib/utils';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

interface LatestFromStoresProps {
  products: ProductWithRelations[];
}

export function LatestFromStores({ products }: LatestFromStoresProps) {
  const { currencySymbol } = useDisplaySettings();
  if (products.length === 0) return null;

  return (
    <section
      data-reveal
      data-reveal-stagger="1"
      className="py-[100px] px-6 md:px-10 lg:px-12 bg-[var(--bg)] border-t"
      style={{ borderColor: 'rgba(29,110,255,0.15)' }}
    >
      <div data-reveal-child className="flex items-end justify-between mb-10">
        <div>
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)] inline-flex items-center gap-3">
            <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
            From vendors
          </p>
          <h2 className="mt-3 font-display font-extrabold leading-[1.05]" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', letterSpacing: '-1.6px' }}>
            From Our <span className="insync-gradient-text italic">Stores</span>
          </h2>
        </div>
        <Link
          href="/shop"
          data-cursor="interactive"
          className="inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--white)] transition-colors duration-150"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div data-reveal-child className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product, i) => {
          const isWide = i % 5 === 1; // occasional cinematic wide card
          if (!isWide) {
            // Style A — Neon border card (uses existing ProductCard logic)
            return (
              <div
                key={product.id}
                className="group rounded-[14px] overflow-hidden"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(29,110,255,0.3)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                }}
              >
                <div className="relative">
                  {/* Shimmer sweep overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ zIndex: 5 }}
                  >
                    <div
                      className="absolute top-0 left-0 h-full w-[40%]"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
                        animation: 'insyncShimmerSweep 0.9s ease forwards',
                      }}
                    />
                  </div>

                  <ProductCard product={product} density="compact" />
                </div>
              </div>
            );
          }

          // Style B — Cinematic wide card (featured vendor products)
          const img = getFirstProductImage(product.images);
          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              data-cursor="interactive"
              className="group relative overflow-hidden rounded-[16px] border"
              style={{
                gridColumn: '1 / -1',
                minHeight: 220,
                borderColor: 'rgba(29,110,255,0.15)',
                background: 'rgba(6,18,50,0.7)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
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
                    'linear-gradient(to right, rgba(2,10,24,0.92), rgba(2,10,24,0.4) 55%, transparent)',
                }}
              />

              <div className="relative z-[2] p-6 md:p-7 max-w-[520px]">
                <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--cyan)' }}>
                  {product.store.name}
                </div>
                <div className="mt-2 font-display text-[20px] md:text-[26px] font-extrabold leading-[1.15]" style={{ color: 'var(--white)', letterSpacing: '-0.8px' }}>
                  {product.title}
                </div>
                <div className="mt-2 font-display text-[28px] md:text-[34px] font-black insync-gradient-text">
                  {formatPrice(Number(product.price), currencySymbol)}
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-[8px] px-4 py-2 border"
                  style={{ borderColor: 'rgba(29,110,255,0.22)', background: 'rgba(29,110,255,0.06)' }}
                >
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(238,242,255,0.82)' }}>
                    View product
                  </span>
                  <ArrowRight className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
                </div>
              </div>

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 0 0 1px #00c8ff, 0 0 24px rgba(0,200,255,0.18)' }}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
