import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProductForm } from '@/components/vendor/ProductForm';

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await auth();
  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: true },
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
          isActive: product.isActive,
        }}
      />
    </div>
  );
}
