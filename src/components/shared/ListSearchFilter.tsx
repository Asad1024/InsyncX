'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export interface ListSearchFilterOption {
  value: string;
  label: string;
}

export interface ListSearchFilterConfig {
  param: string;
  label: string;
  options: ListSearchFilterOption[];
}

interface ListSearchFilterProps {
  basePath: string;
  placeholder?: string;
  searchParamKey?: string;
  currentSearch?: string;
  filters?: ListSearchFilterConfig[];
  currentFilters?: Record<string, string>;
}

export function ListSearchFilter({
  basePath,
  placeholder = 'Search…',
  searchParamKey = 'search',
  currentSearch = '',
  filters = [],
  currentFilters = {},
}: ListSearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v != null && v !== '') next.set(k, v);
      else next.delete(k);
    });
    router.push(`${basePath}?${next.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="list-search"]');
    update({ [searchParamKey]: input?.value?.trim() ?? '' });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-4)' }} />
          <input
            type="search"
            name="list-search"
            placeholder={placeholder}
            defaultValue={currentSearch}
            className="w-full rounded-xl border pl-9 pr-4 py-2.5 font-sans text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)]"
            style={{ background: 'var(--surface2)', borderColor: 'var(--line)', color: 'var(--text)' }}
          />
        </div>
        <button
          type="submit"
          className="rounded-xl px-4 py-2.5 font-sans text-[13px] font-medium border shrink-0 transition-colors hover:opacity-90"
          style={{ borderColor: 'var(--line-gold)', color: 'var(--gold)', background: 'var(--gold-bg)' }}
        >
          Search
        </button>
      </form>
      {filters.map(({ param, label, options }) => (
        <select
          key={param}
          value={currentFilters[param] ?? ''}
          onChange={(e) => update({ [param]: e.target.value || undefined })}
          className="rounded-xl border px-4 py-2.5 font-sans text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] min-w-[140px]"
          style={{ background: 'var(--surface2)', borderColor: 'var(--line)', color: 'var(--text)' }}
        >
          <option value="">{label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
