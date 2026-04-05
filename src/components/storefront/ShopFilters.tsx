'use client';

import { useEffect, useRef, useState } from 'react';
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

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name' },
];

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
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (sortRef.current?.contains(e.target as Node)) return;
      setSortOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const update = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, v]) => {
      if (v) next.set(key, v);
      else next.delete(key);
    });
    next.delete('page');
    router.push(`/shop?${next.toString()}`);
  };

  const sortLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? 'Newest';

  const pillBase =
    'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 font-sans text-[11px] font-medium transition-all duration-[200ms] ease-out sm:px-4 sm:py-2 sm:text-[12px]';
  const pillActive =
    'border-transparent bg-gradient-to-br from-[var(--blue)] to-[var(--blue-mid)] font-semibold text-white shadow-[0_0_16px_rgba(29,110,255,0.35)]';
  const pillIdle =
    'border-[var(--border)]/80 bg-[rgba(255,255,255,0.03)] text-[var(--muted)] hover:border-[rgba(29,110,255,0.45)] hover:bg-[rgba(29,110,255,0.08)] hover:text-[var(--white)]';

  const allActive =
    !currentCategory && !searchParams.get('featured') && !searchParams.get('new');

  return (
    <div className="sticky top-[calc(var(--nav-h)+10px)] z-40 flex justify-center px-4 pb-3 pt-1">
      <div
        className="flex w-full max-w-5xl flex-col gap-2.5 rounded-2xl border border-white/10 bg-[rgba(4,14,32,0.52)] px-3 py-2.5 shadow-[0_12px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[14px] sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:px-4 sm:py-2"
        style={{ WebkitBackdropFilter: 'blur(14px)' }}
      >
        <form
          className="group relative flex w-full shrink-0 sm:max-w-[200px] md:max-w-[220px]"
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector<HTMLInputElement>('input[name="shop-search"]');
            const value = input?.value?.trim() ?? '';
            update({ search: value });
          }}
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)] transition-colors duration-200 group-focus-within:text-[var(--cyan)] sm:left-4 sm:h-4 sm:w-4" />
          <input
            type="search"
            name="shop-search"
            placeholder="Search…"
            defaultValue={search}
            autoComplete="off"
            className="w-full rounded-full border border-[var(--border)]/70 bg-[rgba(29,110,255,0.06)] py-2 pl-10 pr-3 font-sans text-[13px] text-[var(--white)] outline-none transition-all duration-200 placeholder:text-[var(--muted)] focus:border-[var(--cyan)]/60 focus:shadow-[0_0_0_2px_rgba(0,200,255,0.12)] sm:py-2.5 sm:pl-11 sm:text-[14px]"
          />
        </form>

        <div className="flex min-h-[38px] min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => update({ category: '', featured: '', new: '' })}
            className={`${pillBase} ${allActive ? pillActive : pillIdle}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => update({ new: '1', category: '', featured: '' })}
            className={`${pillBase} ${
              newArrivals || searchParams.get('new') === '1' ? pillActive : pillIdle
            }`}
          >
            New
          </button>
          <button
            type="button"
            onClick={() => update({ featured: '1', category: '', new: '' })}
            className={`${pillBase} ${
              featured || searchParams.get('featured') === '1' ? pillActive : pillIdle
            }`}
          >
            Featured
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => update({ category: c.slug, featured: '', new: '' })}
              className={`${pillBase} ${currentCategory === c.slug ? pillActive : pillIdle}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
          <span className="font-sans text-[11px] text-[var(--muted)] tabular-nums md:text-[12px]">
            {totalCount} item{totalCount !== 1 ? 's' : ''}
          </span>
          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSortOpen((o) => !o);
              }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-[11px] font-medium transition-all duration-200 sm:px-4 sm:py-2 sm:text-[12px] ${
                sortOpen
                  ? 'border-transparent bg-gradient-to-br from-[var(--blue)] to-[var(--blue-mid)] font-semibold text-white shadow-[0_0_16px_rgba(29,110,255,0.35)]'
                  : 'border-[var(--border)]/80 bg-[rgba(255,255,255,0.03)] text-[var(--muted)] hover:border-[rgba(29,110,255,0.45)] hover:text-[var(--white)]'
              }`}
            >
              <span className="max-w-[100px] truncate sm:max-w-[140px]">{sortLabel}</span>
              <ChevronDown
                className={`h-3 w-3 shrink-0 transition-transform sm:h-3.5 sm:w-3.5 ${sortOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {sortOpen && (
              <div
                className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[200px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg2)]/95 py-1 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-[16px]"
                role="listbox"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={currentSort === opt.value}
                    onClick={() => {
                      update({ sort: opt.value });
                      setSortOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left font-sans text-[13px] text-[var(--white)] transition-colors duration-200 hover:bg-[var(--glass)] hover:text-[var(--cyan)]"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
