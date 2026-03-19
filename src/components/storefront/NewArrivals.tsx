'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product, Store, Category } from '@prisma/client';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'lgbtq', label: 'LGBTQ+' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'party', label: 'Party' },
];

interface NewArrivalsProps {
  products: ProductWithRelations[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
  const [activeTab, setActiveTab] = useState('all');

  const filtered =
    activeTab === 'all'
      ? products
      : products.filter((p) => p.category.slug === activeTab);

  return (
    <section
      id="fresh-arrivals"
      className="py-20 px-12 bg-[var(--surface)] border-t scroll-mt-[var(--nav-h)]"
      style={{ borderColor: 'var(--line)' }}
    >
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--text-4)]">Just Dropped</p>
          <h2 className="section-title mt-0 text-[40px] md:text-[48px]">
            Fresh <em>Arrivals</em>
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 font-sans text-[15px] font-medium text-[var(--gold)] hover:text-[var(--gold-dim)] transition-colors duration-150"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="border-b mb-8" style={{ borderColor: 'var(--line)' }}>
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="font-sans text-[15px] font-medium py-3 px-5 border-b-2 bg-transparent border-t-0 border-x-0 cursor-pointer transition-all duration-150"
              style={{
                color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-3)',
                borderBottomColor: activeTab === tab.id ? 'var(--gold)' : 'transparent',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
