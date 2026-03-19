import { Navbar } from '@/components/storefront/Navbar';
import { CartSidebar } from '@/components/storefront/CartSidebar';
import { SearchOverlay } from '@/components/storefront/SearchOverlay';
import { MobileDrawer } from '@/components/storefront/MobileDrawer';
import { getCategories, getApprovedStores } from '@/actions/product.actions';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: { id: string; name: string; slug: string }[] = [];
  let stores: { name: string; slug: string }[] = [];
  try {
    const [c, s] = await Promise.all([getCategories(), getApprovedStores(3)]);
    categories = c.map((cat) => ({ id: cat.id, name: cat.name, slug: cat.slug }));
    stores = s.map((st) => ({ name: st.name, slug: st.slug }));
  } catch {
    // ignore
  }
  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <Navbar categories={categories} stores={stores} />
      <main>{children}</main>
      <CartSidebar />
      <SearchOverlay />
      <MobileDrawer />
    </div>
  );
}
