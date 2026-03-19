'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Category = { id: string; name: string; slug: string };

export function VendorProductFilters({
  categories,
  currentStatus,
  currentSearch,
  currentCategory,
}: {
  categories: Category[];
  currentStatus?: string;
  currentSearch?: string;
  currentCategory?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (updates: Record<string, string>) => {
    const next = new URLSearchParams();
    if (currentStatus) next.set('status', currentStatus);
    if (currentSearch) next.set('search', currentSearch);
    if (currentCategory) next.set('category', currentCategory);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    router.push(`/vendor/products?${next.toString()}`);
  };

  return (
    <form className="flex flex-wrap gap-3 mb-6" onSubmit={(e) => e.preventDefault()}>
      {currentStatus && <input type="hidden" name="status" value={currentStatus} />}
      <input
        type="search"
        placeholder="Search products…"
        defaultValue={currentSearch ?? ''}
        className="input max-w-[280px]"
        name="search"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            update({ search: (e.target as HTMLInputElement).value });
          }
        }}
      />
      <select
        name="category"
        className="input max-w-[180px]"
        value={currentCategory ?? ''}
        onChange={(e) => update({ category: e.target.value || '' })}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </form>
  );
}
