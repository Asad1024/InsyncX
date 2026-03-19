import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProductForm } from '@/components/vendor/ProductForm';
import { Package } from 'lucide-react';

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!store) return <p className="text-[var(--text-3)]">No store.</p>;
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const stores = session.user.role === 'ADMIN' ? await prisma.store.findMany({ orderBy: { name: 'asc' } }) : [];

  return (
    <div>
      <PageHeader
        title="Add Product"
        subtitle="Fill in the details below"
        actions={
          <Link href="/vendor/products" className="btn btn-ghost btn-sm">
            Back
          </Link>
        }
      />
      <div className="grid gap-8 items-start" style={{ gridTemplateColumns: '60% 1fr' }}>
        <div>
          <ProductForm categories={categories} storeId={store.id} stores={stores} isAdmin={session.user.role === 'ADMIN'} />
        </div>
        <div className="sticky top-20 space-y-4">
          <div className="card card-p mb-4">
            <h2 className="font-display text-[20px] font-normal mb-4" style={{ color: 'var(--text)' }}>
              Publish
            </h2>
            <p className="font-sans text-[13px] mb-5" style={{ color: 'var(--text-3)' }}>
              Use the form to set status and submit.
            </p>
            <p className="font-sans text-[12px]" style={{ color: 'var(--text-4)' }}>
              Save as Draft or Publish from the form below.
            </p>
          </div>
          <div className="card overflow-hidden">
            <div className="py-3.5 px-4 border-b" style={{ borderColor: 'var(--line)' }}>
              <p className="font-sans text-[11px] uppercase" style={{ color: 'var(--text-4)' }}>Preview</p>
            </div>
            <div className="p-4 flex items-center justify-center aspect-[3/4] bg-[var(--surface2)]">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--text-4)' }} />
                <p className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>Preview updates when you save</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
