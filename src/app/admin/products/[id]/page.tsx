import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProductForm } from '@/components/vendor/ProductForm';
import { ProductCard } from '@/components/storefront/ProductCard';

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await auth();
  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: true, category: { select: { name: true, slug: true } } },
  });
  if (!product) notFound();
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const stores = await prisma.store.findMany({ orderBy: { name: 'asc' } });
  const images = Array.isArray(product.images) ? product.images as string[] : typeof product.images === 'string' ? JSON.parse(product.images) as string[] : [];
  const tags = Array.isArray(product.tags) ? product.tags as string[] : typeof product.tags === 'string' ? JSON.parse(product.tags) as string[] : [];

  return (
    <div>
      <PageHeader
        title="Edit Product"
        subtitle="Fill in the details below"
        actions={<Link href="/admin/products" className="btn btn-ghost btn-sm">Back</Link>}
      />
      <div className="grid gap-8 items-start" style={{ gridTemplateColumns: '60% 1fr' }}>
        <div>
          <ProductForm
            productId={product.id}
            categories={categories}
            storeId={product.storeId}
            stores={stores}
            isAdmin={true}
            initial={{
              title: product.title,
              description: product.description,
              price: Number(product.price),
              comparePrice: product.comparePrice != null ? Number(product.comparePrice) : undefined,
              images,
              stock: product.stock,
              sku: product.sku ?? '',
              categoryId: product.categoryId,
              tags,
              isFeatured: product.isFeatured,
              isNewArrival: product.isNewArrival ?? false,
              isActive: product.isActive,
            }}
          />
        </div>
        <div className="sticky top-20 space-y-4">
          <div className="card card-p mb-4">
            <h2 className="font-display text-[20px] font-normal mb-4" style={{ color: 'var(--text)' }}>
              Publish
            </h2>
            <p className="font-sans text-[13px] mb-5" style={{ color: 'var(--text-3)' }}>
              Use the form to set status and submit.
            </p>
          </div>
          <div className="card overflow-hidden">
            <div className="py-3.5 px-4 border-b" style={{ borderColor: 'var(--line)' }}>
              <p className="font-sans text-[11px] uppercase" style={{ color: 'var(--text-4)' }}>Preview</p>
            </div>
            <div className="p-4">
              <ProductCard
                product={{
                  ...product,
                  store: { name: product.store.name, slug: product.store.slug, isOfficial: product.store.isOfficial },
                  category: { name: product.category.name, slug: product.category.slug },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
