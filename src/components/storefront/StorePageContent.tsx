'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from './ProductCard';
import { PackageSearch } from 'lucide-react';
import type { Category } from '@prisma/client';

type Product = {
  id: string;
  title: string;
  slug: string;
  price: unknown;
  comparePrice: unknown;
  images: unknown;
  isFeatured: boolean;
  category: Pick<Category, 'name' | 'slug'>;
};

type Store = {
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  isOfficial: boolean;
  products: Product[];
};

interface StorePageContentProps {
  store: Store;
  categories: { id: string; name: string; slug: string }[];
}

function getGradientFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash % 3);
  const gradients = [
    'linear-gradient(135deg, #0f0f1a 0%, #1a1a3a 100%)',
    'linear-gradient(135deg, #0f1a0f 0%, #1a2e1a 100%)',
    'linear-gradient(135deg, #1a0f0f 0%, #2e1a0f 100%)',
  ];
  return gradients[h];
}

export function StorePageContent({ store, categories }: StorePageContentProps) {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc' | 'name'>('newest');
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    let list = [...store.products];
    if (category) {
      list = list.filter((p) => p.category.slug === category);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (sort === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'name') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [store.products, category, search, sort]);

  const productCount = store.products?.length ?? 0;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div
        className="relative aspect-[16/5] max-h-[320px] w-full overflow-hidden bg-[var(--surface2)]"
      >
        {store.banner ? (
          <Image
            src={store.banner}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: getGradientFromName(store.name) }}
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="max-w-[var(--content-max)] mx-auto px-12 relative">
        <div className="relative -mt-10 inline-block">
          <div className="w-20 h-20 rounded-full border-[3px] border-[var(--surface)] overflow-hidden bg-[var(--gold-bg)] flex items-center justify-center shrink-0">
            {store.logo ? (
              <Image src={store.logo} alt="" width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              <span className="font-display text-[32px] font-normal text-[var(--gold)]">
                {store.name.slice(0, 1)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mt-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-light text-[40px] text-[var(--text)]">
                {store.name}
              </h1>
              {store.isOfficial && (
                <span className="badge badge-gold-outline">Official Store</span>
              )}
            </div>
            {store.description && (
              <p className="font-sans text-[14px] text-[var(--text-3)] max-w-[560px] mt-2 leading-[1.7]">
                {store.description}
              </p>
            )}
            <div className="flex items-center gap-8 mt-4">
              <span className="font-sans text-[13px] text-[var(--text-3)]">
                {productCount} Products
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-[var(--line)] my-8" />

        <div className="pb-24">
          <div
            className="sticky top-[64px] z-40 border-b py-3 px-0 mb-6 -mx-12 px-12"
            style={{
              background: 'rgba(9,9,11,0.95)',
              backdropFilter: 'blur(20px)',
              borderColor: 'var(--line)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative max-w-[280px] w-full flex-shrink-0">
                <input
                  type="search"
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[var(--surface2)] border rounded-[10px] py-2.5 pl-10 pr-3.5 font-sans text-[13px] text-[var(--text)] placeholder:text-[var(--text-4)] outline-none transition-all duration-150 focus:border-[var(--line-gold)]"
                  style={{ borderColor: 'var(--line)' }}
                />
              </div>
              <div className="flex flex-1 gap-1.5 overflow-x-auto min-w-0 py-0.5">
                <button
                  type="button"
                  onClick={() => setCategory(undefined)}
                  className={`font-sans text-[12px] font-medium py-1.5 px-3.5 rounded-full border shrink-0 whitespace-nowrap transition-all duration-150 ${
                    !category ? 'bg-[var(--gold-bg)] border-[var(--line-gold)] text-[var(--gold)]' : 'bg-transparent border-[var(--line)] text-[var(--text-3)] hover:border-[var(--line-md)] hover:text-[var(--text-2)]'
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.slug)}
                    className={`font-sans text-[12px] font-medium py-1.5 px-3.5 rounded-full border shrink-0 whitespace-nowrap transition-all duration-150 ${
                      category === c.slug ? 'bg-[var(--gold-bg)] border-[var(--line-gold)] text-[var(--gold)]' : 'bg-transparent border-[var(--line)] text-[var(--text-3)] hover:border-[var(--line-md)] hover:text-[var(--text-2)]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <div className="relative flex-shrink-0 ml-auto">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="appearance-none bg-[var(--surface2)] border rounded-[10px] py-2.5 pl-3.5 pr-9 font-sans text-[13px] text-[var(--text-2)] cursor-pointer outline-none focus:border-[var(--line-gold)]"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="font-sans text-[13px] text-[var(--text-3)]">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-24 px-12 text-center">
              <PackageSearch className="w-16 h-16 text-[var(--text-4)] mx-auto mb-6" />
              <h2 className="font-display font-light text-[36px] text-[var(--text)]">
                {store.products.length === 0 ? 'This store has no products yet' : 'No products found'}
              </h2>
              <p className="font-sans text-[14px] text-[var(--text-3)] mt-3">
                {store.products.length === 0 ? '' : 'Try adjusting your filters'}
              </p>
              {store.products.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setCategory(undefined); setSearch(''); }}
                  className="btn btn-ghost mt-6"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    store: {
                      name: store.name,
                      slug: store.slug,
                      isOfficial: store.isOfficial,
                    },
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
