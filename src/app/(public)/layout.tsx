import { Navbar } from '@/components/storefront/Navbar';
import { CartSidebar } from '@/components/storefront/CartSidebar';
import { SearchOverlay } from '@/components/storefront/SearchOverlay';
import { MobileDrawer } from '@/components/storefront/MobileDrawer';
import { DisplaySettingsProvider } from '@/context/display-settings';
import { getCategories, getApprovedStores } from '@/actions/product.actions';
import { getPlatformDisplaySettings } from '@/lib/platform-settings';
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: { id: string; name: string; slug: string }[] = [];
  let stores: { name: string; slug: string }[] = [];
  let displaySettings = await getPlatformDisplaySettings();
  try {
    const [c, s] = await Promise.all([getCategories(), getApprovedStores(3)]);
    categories = c.map((cat) => ({ id: cat.id, name: cat.name, slug: cat.slug }));
    stores = s.map((st) => ({ name: st.name, slug: st.slug }));
  } catch {
    // ignore
  }
  return (
    <DisplaySettingsProvider value={displaySettings}>
      <div className="min-h-screen bg-background" suppressHydrationWarning>
        <Navbar categories={categories} stores={stores} />
        <main className="pt-[var(--nav-h)]">{children}</main>
        <CartSidebar />
        <SearchOverlay />
        <MobileDrawer />
      </div>
    </DisplaySettingsProvider>
  );
}
