import { Suspense } from 'react';
import { Hero } from '@/components/storefront/Hero';
import { Marquee } from '@/components/storefront/Marquee';
import { AmbientSection } from '@/components/storefront/AmbientSection';
import { DropWheelCarousel } from '@/components/storefront/DropWheelCarousel';
import { SpotlightSection } from '@/components/storefront/SpotlightSection';
import { FooterCTA } from '@/components/storefront/FooterCTA';
import { CategoryGrid } from '@/components/storefront/CategoryGrid';
import { Footer } from '@/components/storefront/Footer';
import { getCategories, getFeaturedProducts } from '@/actions/product.actions';
import { getHomepageFeaturedCoupons } from '@/actions/coupon.actions';
import { HomepageCouponSection } from '@/components/storefront/HomepageCouponSection';
import {
  NewArrivalsSkeleton,
  LatestFromStoresSkeleton,
  OfficialPicksSkeleton,
} from '@/components/storefront/HomeProductSkeleton';
import {
  NewArrivalsSection,
  LatestFromStoresSection,
  OfficialPicksSection,
} from './home-product-sections';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let homepageCoupons: Awaited<ReturnType<typeof getHomepageFeaturedCoupons>> = [];
  let dbOk = true;

  try {
    [categories, featuredProducts, homepageCoupons] = await Promise.all([
      getCategories(),
      getFeaturedProducts(),
      getHomepageFeaturedCoupons(),
    ]);
  } catch {
    dbOk = false;
  }

  const marqueeCategoryNames = categories.map((c) => c.name);

  return (
    <>
      {!dbOk && (
        <div className="bg-sky-500/10 border-b border-sky-500/30 text-sky-200 text-center py-2 px-4 text-sm">
          Database not connected. Set <code className="bg-black/20 px-1 rounded">DATABASE_URL</code> in{' '}
          <code className="bg-black/20 px-1 rounded">.env</code> and run <code className="bg-black/20 px-1 rounded">npx prisma db push</code> and{' '}
          <code className="bg-black/20 px-1 rounded">npm run db:seed</code>.
        </div>
      )}
      <Hero featuredProducts={featuredProducts.slice(0, 10)} />
      <div className="insync-home-culture-wrap">
        <AmbientSection />
      </div>
      <div className="insync-home-sections-stack">
        <div className="insync-home-category-arrivals-col">
          <CategoryGrid categories={categories} />
          <Suspense fallback={<NewArrivalsSkeleton />}>
            <NewArrivalsSection />
          </Suspense>
        </div>
        <div className="insync-home-marquee-stores-wrap">
          <Marquee items={marqueeCategoryNames} />
          <Suspense fallback={<LatestFromStoresSkeleton />}>
            <LatestFromStoresSection />
          </Suspense>
        </div>
        <div className="insync-home-after-stores-dropwheel">
          <DropWheelCarousel products={featuredProducts.slice(0, 7)} />
        </div>
        <div className="insync-home-spotlight-after-wheel">
          <SpotlightSection product={featuredProducts[0] ?? null} />
        </div>
        <div className="insync-home-official-after-spotlight">
          <Suspense fallback={<OfficialPicksSkeleton />}>
            <OfficialPicksSection />
          </Suspense>
        </div>
        {homepageCoupons.length > 0 && <HomepageCouponSection coupons={homepageCoupons} />}
        <div className="insync-home-footer-cta-tight">
          <FooterCTA />
        </div>
        <Footer className="insync-home-footer-after-cta" />
      </div>
    </>
  );
}
