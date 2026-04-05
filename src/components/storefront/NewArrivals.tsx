'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product, Store, Category } from '@prisma/client';
import { SectionReveal } from '@/components/motion/SectionReveal';
import { RevealItem } from '@/components/motion/RevealItem';

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
    <SectionReveal
      stagger
      id="fresh-arrivals"
      className="scroll-mt-[var(--nav-h)] bg-[var(--bg)] px-6 pb-12 pt-8 md:px-10 md:pb-14 md:pt-10 lg:px-12 lg:pb-16 lg:pt-12"
    >
      <RevealItem className="mb-10 flex items-end justify-between">
        <div>
          <p className="inline-flex items-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)]">
            <span className="inline-block h-px w-7" style={{ background: 'rgba(0,200,255,0.7)' }} />
            Just Dropped
          </p>
          <h2 className="mt-3 font-display font-extrabold leading-[1.05]" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', letterSpacing: '-1.6px' }}>
            Fresh <span className="insync-gradient-text italic">Arrivals</span>
          </h2>
        </div>
        <Link
          href="/shop"
          data-cursor="interactive"
          className="inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition-colors duration-150 hover:text-[var(--white)]"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </RevealItem>

      <RevealItem className="mb-8">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              data-cursor="interactive"
              className="rounded-full border px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] transition-all duration-200"
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
      </RevealItem>

      <RevealItem className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} storefrontGlass density="slim" landingShine />
        ))}
      </RevealItem>
    </SectionReveal>
  );
}
