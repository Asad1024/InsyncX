'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useDebounce } from '@/hooks/useDebounce';
import { searchProducts, getCategoriesWithProducts } from '@/actions/product.actions';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

type CategoryOption = { name: string; slug: string };

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchProducts>>>([]);
  const [loading, setLoading] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState<CategoryOption[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  const runSearch = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const data = await searchProducts(debouncedQuery, 10);
    setResults(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [debouncedQuery]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    if (searchOpen) {
      document.addEventListener('keydown', onKeyDown);
      setQuery('');
      getCategoriesWithProducts().then(setSuggestedCategories);
    }
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [searchOpen, setSearchOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  };

  if (!searchOpen) return null;

  const images = (p: { images: unknown }) => {
    const imgs = p.images;
    if (Array.isArray(imgs) && imgs[0]) return imgs[0] as string;
    if (typeof imgs === 'string') {
      try {
        const arr = JSON.parse(imgs) as string[];
        return arr[0];
      } catch {
        return '';
      }
    }
    return '';
  };

  return (
    <div
      className="fixed inset-0 z-[500] transition-opacity duration-[250ms]"
      style={{
        background: 'rgba(9,9,11,0.97)',
        backdropFilter: 'blur(8px)',
        opacity: searchOpen ? 1 : 0,
        pointerEvents: searchOpen ? 'auto' : 'none',
      }}
    >
      <div className="max-w-[640px] mx-auto pt-[120px] px-6 pb-10">
        <form onSubmit={handleSubmit} className="relative mb-12">
          <input
            type="text"
            autoComplete="off"
            placeholder="Search products, stores…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 border-b rounded-none py-4 pr-12 pl-0 font-display text-[36px] font-light text-white placeholder:text-zinc-400 focus:outline-none focus:ring-0 caret-[var(--gold)] transition-[var(--ease)]"
            style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)' }}
            autoFocus
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 border border-white/20 text-zinc-300 hover:text-white hover:bg-white/15 transition-[var(--ease)]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {!query.trim() && (
          <div className="mb-8">
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400 mb-3">
              Try searching for
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedCategories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setQuery(cat.name)}
                  className="font-sans text-[12px] font-medium py-2 px-4 rounded-full bg-white/10 border border-white/25 text-zinc-200 cursor-pointer hover:border-[var(--line-gold)] hover:text-[var(--gold)] transition-[var(--ease)]"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <p className="font-sans text-[13px] text-zinc-300">Searching...</p>
        )}
        {!loading && debouncedQuery.trim() && (
          <ul className="space-y-0">
            {results.length === 0 ? (
              <li className="font-sans text-[14px] text-zinc-400 py-6">
                No products found.
              </li>
            ) : (
              results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex gap-4 py-4 border-b border-white/15 transition-[var(--ease)] hover:bg-white/5"
                  >
                    <div className="relative w-16 h-20 shrink-0 rounded-[10px] overflow-hidden bg-white/10">
                      {images(p) ? (
                        <Image
                          src={images(p)}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[16px] text-white truncate">
                        {p.title}
                      </p>
                      <p className="font-sans text-[13px] text-[var(--gold)]">
                        {formatPrice(Number(p.price))}
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => setSearchOpen(false)}
        className="fixed top-6 right-6 w-10 h-10 rounded-[10px] flex items-center justify-center bg-white/10 border border-white/25 text-zinc-300 hover:text-white hover:bg-white/15 hover:border-white/40 transition-[var(--ease)] cursor-pointer"
        style={{ zIndex: 501 }}
        aria-label="Close search"
      >
        <X className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
}
