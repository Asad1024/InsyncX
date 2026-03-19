'use client';

import Link from 'next/link';
import { ProductCard } from './ProductCard';
import type { Product, Store, Category } from '@prisma/client';
import { ArrowRight } from 'lucide-react';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

interface LatestFromStoresProps {
  products: ProductWithRelations[];
}

export function LatestFromStores({ products }: LatestFromStoresProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 px-12 bg-[var(--surface)] border-t" style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--text-4)]">From vendors</p>
          <h2 className="section-title mt-0 text-[40px] md:text-[48px]">
            From Our <em>Stores</em>
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 font-sans text-[15px] font-medium text-[var(--gold)] hover:text-[var(--gold-dim)] transition-colors duration-150"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
