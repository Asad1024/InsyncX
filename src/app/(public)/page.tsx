import { Hero } from '@/components/storefront/Hero';
import { Marquee } from '@/components/storefront/Marquee';
import { CategoryGrid } from '@/components/storefront/CategoryGrid';
import { NewArrivals } from '@/components/storefront/NewArrivals';
import { OfficialPicksScroll } from '@/components/storefront/OfficialPicksScroll';
import { PromoBanner } from '@/components/storefront/PromoBanner';
import { VendorSpotlight } from '@/components/storefront/VendorSpotlight';
import { CustomerSupportBanner } from '@/components/storefront/CustomerSupportBanner';
import { FAQAccordion } from '@/components/storefront/FAQAccordion';
import { QuickInfoStrip } from '@/components/storefront/QuickInfoStrip';
import { Footer } from '@/components/storefront/Footer';
import {
  getCategories,
  getLatestProducts,
  getOfficialStoreProducts,
  getApprovedStores,
  getFeaturedProducts,
} from '@/actions/product.actions';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let newArrivals: Awaited<ReturnType<typeof getLatestProducts>> = [];
  let officialPicks: Awaited<ReturnType<typeof getOfficialStoreProducts>> = [];
  let stores: Awaited<ReturnType<typeof getApprovedStores>> = [];
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let dbOk = true;

  try {
    [categories, newArrivals, officialPicks, stores, featuredProducts] = await Promise.all([
      getCategories(),
      getLatestProducts(8),
      getOfficialStoreProducts(8),
      getApprovedStores(3),
      getFeaturedProducts(),
    ]);
  } catch {
    dbOk = false;
  }

  const marqueeCategoryNames = categories.map((c) => c.name);

  return (
    <>
      {!dbOk && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-center py-2 px-4 text-sm">
          Database not connected. Set <code className="bg-black/20 px-1 rounded">DATABASE_URL</code> in <code className="bg-black/20 px-1 rounded">.env</code> and run <code className="bg-black/20 px-1 rounded">npx prisma db push</code> and <code className="bg-black/20 px-1 rounded">npm run db:seed</code>.
        </div>
      )}
      <Hero featuredProducts={featuredProducts.slice(0, 10)} />
      <Marquee items={marqueeCategoryNames} />
      <CategoryGrid categories={categories} />
      <NewArrivals products={newArrivals} />
      <OfficialPicksScroll products={officialPicks} />
      <PromoBanner />
      <VendorSpotlight stores={stores} />
      <CustomerSupportBanner />
      <FAQAccordion />
      <QuickInfoStrip />
      <Footer />
    </>
  );
}
