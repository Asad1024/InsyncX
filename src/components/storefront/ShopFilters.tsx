'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import type { Category } from '@prisma/client';

interface ShopFiltersProps {
  categories: Category[];
  currentCategory?: string;
  currentSort?: string;
  search?: string;
  totalCount: number;
}

export function ShopFilters({
  categories,
  currentCategory,
  currentSort = 'newest',
  search,
  totalCount,
}: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    next.delete('page');
    router.push(`/shop?${next.toString()}`);
  };

  return (
    <div
      className="sticky top-[64px] z-40 border-b py-3 px-12"
      style={{
        background: 'rgba(9,9,11,0.95)',
        backdropFilter: 'blur(20px)',
        borderColor: 'var(--line)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative max-w-[280px] w-full flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-4)]" />
          <input
            type="search"
            placeholder="Search products…"
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                update({ search: (e.target as HTMLInputElement).value });
              }
            }}
            className="w-full bg-[var(--surface2)] border rounded-[10px] py-3 pl-10 pr-4 font-sans text-[15px] text-[var(--text)] placeholder:text-[var(--text-4)] outline-none transition-all duration-150 focus:border-[var(--line-gold)] focus:shadow-[0_0_0_3px_rgba(212,168,67,0.10)]"
            style={{ borderColor: 'var(--line)' }}
          />
        </div>

        <div className="flex flex-1 gap-1.5 overflow-x-auto min-w-0 py-0.5" style={{ scrollbarWidth: 'none' }}>
          <button
            type="button"
            onClick={() => update({ category: '', featured: '' })}
            className={`font-sans text-[15px] font-medium py-2 px-4 rounded-full border shrink-0 whitespace-nowrap transition-all duration-150 ${
              !currentCategory && !searchParams.get('featured')
                ? 'bg-[var(--gold-bg)] border-[var(--line-gold)] text-[var(--gold)]'
                : 'bg-transparent border-[var(--line)] text-[var(--text-3)] hover:border-[var(--line-md)] hover:text-[var(--text-2)]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => update({ featured: '1', category: '' })}
            className={`font-sans text-[15px] font-medium py-2 px-4 rounded-full border shrink-0 whitespace-nowrap transition-all duration-150 ${
              searchParams.get('featured') === '1'
                ? 'bg-[var(--gold-bg)] border-[var(--line-gold)] text-[var(--gold)]'
                : 'bg-transparent border-[var(--line)] text-[var(--text-3)] hover:border-[var(--line-md)] hover:text-[var(--text-2)]'
            }`}
          >
            Featured
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => update({ category: c.slug, featured: '' })}
              className={`font-sans text-[15px] font-medium py-2 px-4 rounded-full border shrink-0 whitespace-nowrap transition-all duration-150 ${
                currentCategory === c.slug
                  ? 'bg-[var(--gold-bg)] border-[var(--line-gold)] text-[var(--gold)]'
                  : 'bg-transparent border-[var(--line)] text-[var(--text-3)] hover:border-[var(--line-md)] hover:text-[var(--text-2)]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative flex-shrink-0 ml-auto">
          <select
            value={currentSort}
            onChange={(e) => update({ sort: e.target.value })}
            className="appearance-none bg-[var(--surface2)] border rounded-[10px] py-3 pl-4 pr-10 font-sans text-[15px] text-[var(--text-2)] cursor-pointer outline-none transition-all duration-150 focus:border-[var(--line-gold)]"
            style={{ borderColor: 'var(--line)' }}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-4)] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
