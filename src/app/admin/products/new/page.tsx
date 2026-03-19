import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProductForm } from '@/components/vendor/ProductForm';

export default async function AdminNewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const stores = await prisma.store.findMany({ orderBy: { name: 'asc' } });
  const officialStore = stores.find((s) => s.isOfficial);
  const defaultStoreId = officialStore?.id ?? stores[0]?.id ?? '';

  return (
    <div>
      <PageHeader
        title="Add Product"
        subtitle="Fill in the details below"
        actions={<Link href="/admin/products" className="btn btn-ghost btn-sm">Back</Link>}
      />
      <ProductForm
        categories={categories}
        storeId={defaultStoreId}
        stores={stores}
        isAdmin={true}
      />
    </div>
  );
}
