import Link from 'next/link';
import { getProducts, getCategories } from '@/actions/product.actions';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ShopFilters } from '@/components/storefront/ShopFilters';
import { ShopPageBackdrop } from '@/components/storefront/ShopPageBackdrop';
import { Pagination } from '@/components/storefront/Pagination';
import { PackageSearch } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop | InsyncX',
  description: 'Browse all products.',
};

export const dynamic = 'force-dynamic';

interface SearchParams {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; page?: string; featured?: string; new?: string }>;
}

export default async function ShopPage({ searchParams }: SearchParams) {
  const params = await searchParams;
  const category = params.category ?? undefined;
  const search = params.search ?? undefined;
  const sort = (params.sort as 'newest' | 'price-asc' | 'price-desc' | 'name') ?? 'newest';
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const newArrivals = params.new === '1';
  const featured = params.featured === '1';

  const [result, categories] = await Promise.all([
    getProducts({ category, search, sort, page, perPage: 12, newArrivals, featured }),
    getCategories(),
  ]);

  const flatCategories = categories.flatMap((c) => [c, ...c.children]);

  const queryWithoutPage: Record<string, string> = {};
  if (category) queryWithoutPage.category = category;
  if (search) queryWithoutPage.search = search;
  if (sort && sort !== 'newest') queryWithoutPage.sort = sort;
  if (params.featured) queryWithoutPage.featured = params.featured;
  if (newArrivals) queryWithoutPage.new = '1';

  const currentCategoryName = newArrivals
    ? 'New Arrivals'
    : featured
      ? 'Featured'
      : category
        ? flatCategories.find((c) => c.slug === category)?.name
        : null;

  return (
    <div className="relative min-h-screen">
      <ShopPageBackdrop />

      <div
        className="pointer-events-none fixed left-1/2 top-[min(22vh,200px)] z-[1] w-[min(120vw,900px)] -translate-x-1/2 md:top-[min(20vh,240px)]"
        aria-hidden
      >
        <div className="shop-watermark">Shop</div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col items-center gap-2 px-6 pb-1 pt-4 md:px-12 md:pt-5">
          {currentCategoryName && (
            <span
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass)] px-3 py-1 font-sans text-[11px] font-medium text-[var(--cyan)] backdrop-blur-sm"
            >
              {currentCategoryName}
              <Link
                href="/shop"
                className="font-sans text-[12px] text-[var(--muted)] transition-colors hover:text-[#ff6b6b]"
                aria-label="Clear filter"
              >
                ×
              </Link>
            </span>
          )}
        </div>

        <ShopFilters
          categories={flatCategories}
          currentCategory={category}
          currentSort={sort}
          search={search}
          totalCount={result.total}
          newArrivals={newArrivals}
          featured={featured}
        />

        <div className="px-6 pb-16 pt-4 md:px-12 md:pt-6">
          {result.items.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-24 text-center">
              <div
                className="mb-8 flex h-24 w-24 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(29,110,255,0.12)',
                  boxShadow: '0 0 48px rgba(29,110,255,0.25)',
                }}
              >
                <PackageSearch className="h-11 w-11 text-[var(--blue)]" strokeWidth={1.25} />
              </div>
              <h2 className="font-display text-[24px] font-bold text-[var(--white)]">No products found.</h2>
              <p className="mt-3 max-w-md font-sans text-[14px] text-[var(--muted)]">
                Try adjusting your filters or search term.
              </p>
              <Link
                href="/shop"
                className="mt-8 rounded-[10px] border border-[var(--border)] px-8 py-3 font-sans text-[13px] font-medium text-[var(--cyan)] transition-all duration-200 hover:border-[var(--cyan)] hover:bg-[var(--glass)]"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {result.items.map((product, index) => (
                  <div
                    key={product.id}
                    className="shop-card-stagger"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <ProductCard product={product} shopVisual />
                  </div>
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={result.totalPages}
                basePath="/shop"
                queryWithoutPage={queryWithoutPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
