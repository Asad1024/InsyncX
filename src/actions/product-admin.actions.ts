'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';

async function ensureUniqueProductSlug(base: string): Promise<string> {
  const slug = `${slugify(base)}-${Math.random().toString(36).slice(2, 8)}`;
  const existing = await prisma.product.findUnique({ where: { slug } });
  return existing ? ensureUniqueProductSlug(base) : slug;
}

export async function createProduct(params: {
  title: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  sku?: string;
  categoryId: string;
  storeId: string;
  tags: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isActive: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };
  const store = await prisma.store.findUnique({ where: { id: params.storeId } });
  if (!store) return { error: 'Store not found' };
  if (store.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }
  const slug = await ensureUniqueProductSlug(params.title);
  await prisma.product.create({
    data: {
      title: params.title,
      slug,
      description: params.description,
      price: params.price,
      comparePrice: params.comparePrice,
      images: params.images as unknown as object,
      stock: params.stock,
      sku: params.sku,
      categoryId: params.categoryId,
      storeId: params.storeId,
      tags: params.tags as unknown as object,
      isFeatured: params.isFeatured ?? false,
      isNewArrival: params.isNewArrival ?? false,
      isActive: params.isActive,
    },
  });
  revalidatePath('/vendor/products');
  revalidatePath('/shop');
  return { success: true };
}

export async function updateProduct(
  productId: string,
  params: {
    title?: string;
    description?: string;
    price?: number;
    comparePrice?: number;
    images?: string[];
    stock?: number;
    sku?: string;
    categoryId?: string;
    storeId?: string;
    tags?: string[];
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isActive?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { store: true } });
  if (!product) return { error: 'Product not found' };
  if (product.store.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }
  await prisma.product.update({
    where: { id: productId },
    data: {
      title: params.title,
      description: params.description,
      price: params.price,
      comparePrice: params.comparePrice,
      images: params.images as unknown as object,
      stock: params.stock,
      sku: params.sku,
      categoryId: params.categoryId,
      storeId: params.storeId,
      tags: params.tags as unknown as object,
      isFeatured: params.isFeatured,
      isNewArrival: params.isNewArrival,
      isActive: params.isActive,
    },
  });
  revalidatePath('/vendor/products');
  revalidatePath('/shop');
  revalidatePath(`/product/${product.slug}`);
  return { success: true };
}
