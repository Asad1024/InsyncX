import { notFound } from 'next/navigation';
import { getStoreBySlug, getCategories } from '@/actions/product.actions';
import { StorePageContent } from '@/components/storefront/StorePageContent';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return { title: 'Store | InsyncX' };
  return { title: `${store.name} | InsyncX`, description: store.description ?? undefined };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const [store, categories] = await Promise.all([
    getStoreBySlug(slug),
    getCategories(),
  ]);
  if (!store) notFound();

  const categoriesForFilter = categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

  return (
    <StorePageContent
      store={{
        name: store.name,
        slug: store.slug,
        description: store.description,
        logo: store.logo,
        banner: store.banner ?? null,
        isOfficial: store.isOfficial,
        products: store.products ?? [],
      }}
      categories={categoriesForFilter}
    />
  );
}
