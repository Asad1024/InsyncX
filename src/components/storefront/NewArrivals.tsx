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
      data-reveal
      data-reveal-stagger="1"
      className="py-[100px] px-6 md:px-10 lg:px-12 bg-[var(--bg)] border-t scroll-mt-[var(--nav-h)]"
      style={{ borderColor: 'rgba(29,110,255,0.15)' }}
    >
      <div data-reveal-child className="flex items-end justify-between mb-10">
        <div>
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)] inline-flex items-center gap-3">
            <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
            Just Dropped
          </p>
          <h2 className="mt-3 font-display font-extrabold leading-[1.05]" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', letterSpacing: '-1.6px' }}>
            Fresh <span className="insync-gradient-text italic">Arrivals</span>
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

      <div data-reveal-child className="mb-8">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              data-cursor="interactive"
              className="px-4 py-2 rounded-full border font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-all duration-200"
              style={{
                color: activeTab === tab.id ? 'var(--white)' : 'rgba(238,242,255,0.72)',
                background: activeTab === tab.id ? 'linear-gradient(135deg, var(--blue), var(--blue-mid))' : 'rgba(6,18,50,0.45)',
                borderColor: activeTab === tab.id ? 'rgba(29,110,255,0.35)' : 'rgba(29,110,255,0.18)',
                boxShadow: activeTab === tab.id ? '0 0 28px rgba(29,110,255,0.35)' : 'none',
                backdropFilter: 'blur(18px)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div data-reveal-child className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
