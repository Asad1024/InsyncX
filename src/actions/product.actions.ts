'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import type { Prisma } from '@prisma/client';

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      store: { select: { name: true, slug: true, isOfficial: true } },
      category: { select: { name: true, slug: true } },
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getLatestProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    include: {
      store: { select: { name: true, slug: true, isOfficial: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getOfficialStoreProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, store: { isOfficial: true } },
    include: {
      store: { select: { name: true, slug: true, isOfficial: true } },
      category: { select: { name: true, slug: true } },
    },
    take: limit,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      store: { select: { id: true, name: true, slug: true, isOfficial: true } },
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  return prisma.product.findMany({
    where: {
      categoryId,
      isActive: true,
      id: { not: productId },
    },
    include: {
      store: { select: { name: true, slug: true, isOfficial: true } },
      category: { select: { name: true, slug: true } },
    },
    take: limit,
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { name: 'asc' },
  });
}

/** Categories that have at least one active product (for search suggestions). */
export async function getCategoriesWithProducts() {
  const categories = await prisma.category.findMany({
    where: {
      products: { some: { isActive: true } },
    },
    select: { name: true, slug: true },
    orderBy: { name: 'asc' },
  });
  return categories;
}

export async function getApprovedStores(limit = 3) {
  return prisma.store.findMany({
    where: { isActive: true, isApproved: true, isOfficial: false },
    select: { id: true, name: true, slug: true, logo: true, banner: true, description: true },
    take: limit,
  });
}

export async function getStoreBySlug(slug: string) {
  return prisma.store.findFirst({
    where: { slug, isActive: true, isApproved: true },
    include: {
      products: {
        where: { isActive: true },
        include: { category: { select: { name: true, slug: true } } },
      },
    },
  });
}

export type ProductListFilters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'name';
  page?: number;
  perPage?: number;
};

export async function getProducts(filters: ProductListFilters = {}) {
  const { category, minPrice, maxPrice, search, sort = 'newest', page = 1, perPage = 12 } = filters;
  const skip = (page - 1) * perPage;

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (category) {
    const cat = await prisma.category.findFirst({ where: { slug: category } });
    if (cat) where.categoryId = cat.id;
  }
  if (minPrice != null || maxPrice != null) {
    where.price = {};
    if (minPrice != null) (where.price as Prisma.DecimalNullableFilter).gte = minPrice;
    if (maxPrice != null) (where.price as Prisma.DecimalNullableFilter).lte = maxPrice;
  }
  if (search?.trim()) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === 'price-asc'
      ? [{ price: 'asc' }]
      : sort === 'price-desc'
        ? [{ price: 'desc' }]
        : sort === 'name'
          ? [{ title: 'asc' }]
          : [{ createdAt: 'desc' }];

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        store: { select: { name: true, slug: true, isOfficial: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy,
      skip,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function searchProducts(q: string, limit = 10) {
  if (!q?.trim()) return [];
  return prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
      ],
    },
    select: { id: true, title: true, slug: true, price: true, images: true },
    take: limit,
  });
}
