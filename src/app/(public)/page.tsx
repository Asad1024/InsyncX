import { Hero } from '@/components/storefront/Hero';
import { Marquee } from '@/components/storefront/Marquee';
import { AmbientSection } from '@/components/storefront/AmbientSection';
import { DropWheelCarousel } from '@/components/storefront/DropWheelCarousel';
import { SpotlightSection } from '@/components/storefront/SpotlightSection';
import { VendorMarquee } from '@/components/storefront/VendorMarquee';
import { FooterCTA } from '@/components/storefront/FooterCTA';
import { CategoryGrid } from '@/components/storefront/CategoryGrid';
import { NewArrivals } from '@/components/storefront/NewArrivals';
import { LatestFromStores } from '@/components/storefront/LatestFromStores';
import { OfficialPicksScroll } from '@/components/storefront/OfficialPicksScroll';
import { VendorSpotlight } from '@/components/storefront/VendorSpotlight';
import { CustomerSupportBanner } from '@/components/storefront/CustomerSupportBanner';
import { FAQAccordion } from '@/components/storefront/FAQAccordion';
import { QuickInfoStrip } from '@/components/storefront/QuickInfoStrip';
import { Footer } from '@/components/storefront/Footer';
import {
  getCategories,
  getNewArrivalsProducts,
  getLatestProducts,
  getOfficialStoreProducts,
  getApprovedStores,
  getFeaturedProducts,
} from '@/actions/product.actions';
import { getHomepageFeaturedCoupons } from '@/actions/coupon.actions';
import { HomepageCouponSection } from '@/components/storefront/HomepageCouponSection';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let newArrivals: Awaited<ReturnType<typeof getNewArrivalsProducts>> = [];
  let latestProducts: Awaited<ReturnType<typeof getLatestProducts>> = [];
  let officialPicks: Awaited<ReturnType<typeof getOfficialStoreProducts>> = [];
  let stores: Awaited<ReturnType<typeof getApprovedStores>> = [];
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let homepageCoupons: Awaited<ReturnType<typeof getHomepageFeaturedCoupons>> = [];
  let dbOk = true;

  try {
    [categories, newArrivals, latestProducts, officialPicks, stores, featuredProducts, homepageCoupons] = await Promise.all([
      getCategories(),
      getNewArrivalsProducts(8),
      getLatestProducts(8),
      getOfficialStoreProducts(8),
      getApprovedStores(3),
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
          Database not connected. Set <code className="bg-black/20 px-1 rounded">DATABASE_URL</code> in <code className="bg-black/20 px-1 rounded">.env</code> and run <code className="bg-black/20 px-1 rounded">npx prisma db push</code> and <code className="bg-black/20 px-1 rounded">npm run db:seed</code>.
        </div>
      )}
      <Hero featuredProducts={featuredProducts.slice(0, 10)} />
      <Marquee items={marqueeCategoryNames} />
      <AmbientSection />
      <CategoryGrid categories={categories} />
      <NewArrivals products={newArrivals} />
      <LatestFromStores products={latestProducts} />
      <DropWheelCarousel products={featuredProducts.slice(0, 7)} />
      <SpotlightSection product={featuredProducts[0] ?? null} />
      <VendorMarquee stores={stores.map((s) => ({ name: s.name, slug: s.slug }))} />
      <OfficialPicksScroll products={officialPicks} />
      {homepageCoupons.length > 0 && <HomepageCouponSection coupons={homepageCoupons} />}
      <VendorSpotlight stores={stores} />
      <CustomerSupportBanner />
      <FAQAccordion />
      <QuickInfoStrip />
      <FooterCTA />
      <Footer />
    </>
  );
}
