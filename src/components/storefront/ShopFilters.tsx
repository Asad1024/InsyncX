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
  newArrivals?: boolean;
  featured?: boolean;
}

export function ShopFilters({
  categories,
  currentCategory,
  currentSort = 'newest',
  search,
  totalCount,
  newArrivals = false,
  featured = false,
}: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, v]) => {
      if (v) next.set(key, v);
      else next.delete(key);
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
        <form
          className="relative max-w-[280px] w-full flex-shrink-0 flex"
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector<HTMLInputElement>('input[name="shop-search"]');
            const value = input?.value?.trim() ?? '';
            update({ search: value });
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-4)] pointer-events-none z-10" />
          <input
            type="search"
            name="shop-search"
            placeholder="Search by title, tags, description…"
            defaultValue={search}
            autoComplete="off"
            className="w-full bg-[var(--surface2)] border rounded-[10px] py-3 pl-10 pr-10 font-sans text-[15px] text-[var(--text)] placeholder:text-[var(--text-4)] outline-none transition-all duration-150 focus:border-[var(--line-gold)] focus:shadow-[0_0_0_3px_rgba(74,144,226,0.10)]"
            style={{ borderColor: 'var(--line)' }}
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-4)] hover:text-[var(--gold)] hover:bg-[var(--gold-bg)] transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-1 gap-1.5 overflow-x-auto min-w-0 py-0.5" style={{ scrollbarWidth: 'none' }}>
          <button
            type="button"
            onClick={() => update({ category: '', featured: '', new: '' })}
            className={`font-sans text-[15px] font-medium py-2 px-4 rounded-full border shrink-0 whitespace-nowrap transition-all duration-150 ${
              !currentCategory && !searchParams.get('featured') && !searchParams.get('new')
                ? 'bg-[var(--gold-bg)] border-[var(--line-gold)] text-[var(--gold)]'
                : 'bg-transparent border-[var(--line)] text-[var(--text-3)] hover:border-[var(--line-md)] hover:text-[var(--text-2)]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => update({ new: '1', category: '', featured: '' })}
            className={`font-sans text-[15px] font-medium py-2 px-4 rounded-full border shrink-0 whitespace-nowrap transition-all duration-150 ${
              newArrivals || searchParams.get('new') === '1'
                ? 'bg-[var(--gold-bg)] border-[var(--line-gold)] text-[var(--gold)]'
                : 'bg-transparent border-[var(--line)] text-[var(--text-3)] hover:border-[var(--line-md)] hover:text-[var(--text-2)]'
            }`}
          >
            New Arrivals
          </button>
          <button
            type="button"
            onClick={() => update({ featured: '1', category: '', new: '' })}
            className={`font-sans text-[15px] font-medium py-2 px-4 rounded-full border shrink-0 whitespace-nowrap transition-all duration-150 ${
              featured || searchParams.get('featured') === '1'
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
              onClick={() => update({ category: c.slug, featured: '', new: '' })}
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
