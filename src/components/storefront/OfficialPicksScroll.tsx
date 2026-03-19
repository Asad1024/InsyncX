'use client';

import { useRef } from 'react';
import { ProductCard } from './ProductCard';
import type { Product, Store, Category } from '@prisma/client';
import { Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

interface OfficialPicksScrollProps {
  products: ProductWithRelations[];
}

export function OfficialPicksScroll({ products }: OfficialPicksScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    const startX = e.pageX;
    const startScrollLeft = el.scrollLeft;
    const handleMouseMove = (e2: MouseEvent) => {
      el.scrollLeft = startScrollLeft - (e2.pageX - startX) * 2;
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <section className="py-20 px-12 bg-[var(--bg)] border-t" style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="section-label">Curated by InsyncX</p>
          <h2 className="section-title mt-0">
            Official <em>Picks</em>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="inline-flex items-center gap-2 rounded-full border py-1.5 px-3.5 font-sans text-[11px] font-medium text-[var(--gold)]"
            style={{
              background: 'var(--gold-bg)',
              borderColor: 'var(--line-gold)',
            }}
          >
            <Crown className="w-4 h-4" />
            InsyncX Official
          </span>
          <Link
            href="/shop?featured=1"
            className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-[var(--gold)] hover:text-[var(--gold-dim)] transition-colors duration-150"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        className="flex gap-5 overflow-x-auto overflow-y-visible pb-2 cursor-grab active:cursor-grabbing"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="official" />
        ))}
      </div>
    </section>
  );
}
