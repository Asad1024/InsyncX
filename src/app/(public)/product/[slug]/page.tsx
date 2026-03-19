import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/actions/product.actions';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product | InsyncX' };
  return {
    title: `${product.title} | InsyncX`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.title,
      images: Array.isArray(product.images) ? (product.images[0] as string) : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 4);
  const images = Array.isArray(product.images)
    ? (product.images as string[])
    : typeof product.images === 'string'
      ? (JSON.parse(product.images) as string[])
      : [];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <ProductDetailClient
        product={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: Number(product.price),
          comparePrice: product.comparePrice != null ? Number(product.comparePrice) : null,
          images,
          stock: product.stock,
          store: product.store,
          category: product.category,
          reviews: product.reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            userName: r.user.name,
          })),
        }}
        related={related}
      />
    </div>
  );
}
