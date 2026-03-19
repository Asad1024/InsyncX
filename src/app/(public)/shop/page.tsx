import Link from 'next/link';
import { getProducts, getCategories } from '@/actions/product.actions';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ShopFilters } from '@/components/storefront/ShopFilters';
import { Pagination } from '@/components/storefront/Pagination';
import { PackageSearch } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop | InsyncX',
  description: 'Browse all products.',
};

export const dynamic = 'force-dynamic';

interface SearchParams {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; page?: string; featured?: string }>;
}

export default async function ShopPage({ searchParams }: SearchParams) {
  const params = await searchParams;
  const category = params.category ?? undefined;
  const search = params.search ?? undefined;
  const sort = (params.sort as 'newest' | 'price-asc' | 'price-desc' | 'name') ?? 'newest';
  const page = Math.max(1, parseInt(params.page ?? '1', 10));

  const [result, categories] = await Promise.all([
    getProducts({ category, search, sort, page, perPage: 12 }),
    getCategories(),
  ]);

  const queryWithoutPage: Record<string, string> = {};
  if (category) queryWithoutPage.category = category;
  if (search) queryWithoutPage.search = search;
  if (sort && sort !== 'newest') queryWithoutPage.sort = sort;
  if (params.featured) queryWithoutPage.featured = params.featured;

  const currentCategoryName = category ? categories.find((c) => c.slug === category)?.name : null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Page header */}
      <div
        className="flex items-center justify-between py-8 px-12 bg-[var(--surface)] border-b"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="flex items-baseline gap-4">
          <h1 className="font-display font-light text-[40px] text-[var(--text)]">
            Shop
          </h1>
          {currentCategoryName && (
            <span
              className="inline-flex items-center gap-2 rounded-full border py-1 px-3 font-sans text-[11px] font-medium text-[var(--gold)]"
              style={{
                background: 'var(--gold-bg)',
                borderColor: 'var(--line-gold)',
              }}
            >
              {currentCategoryName}
              <Link
                href="/shop"
                className="font-sans text-[12px] text-[var(--text-3)] hover:text-[var(--red)] transition-colors"
                aria-label="Clear category"
              >
                ×
              </Link>
            </span>
          )}
        </div>
        <p className="font-sans text-[15px] text-[var(--text-3)]">
          {result.total} product{result.total !== 1 ? 's' : ''} found
        </p>
      </div>

      <ShopFilters
        categories={categories}
        currentCategory={category}
        currentSort={sort}
        search={search}
        totalCount={result.total}
      />

      <div className="px-12 pt-8">
        {result.items.length === 0 ? (
          <div className="py-24 px-12 text-center">
            <PackageSearch className="w-16 h-16 text-[var(--text-4)] mx-auto mb-6" />
            <h2 className="font-display font-light text-[36px] text-[var(--text)]">
              No products found
            </h2>
            <p className="font-sans text-[14px] text-[var(--text-3)] mt-3">
              Try adjusting your filters or search term
            </p>
            <Link href="/shop" className="btn btn-ghost mt-6">
              Clear All Filters
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
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
  );
}
