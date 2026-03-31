'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import type { Prisma } from '@prisma/client';

/** Only products from approved or official stores are visible on the public site. */
const storeVisibleWhere: Prisma.ProductWhereInput = {
  store: { OR: [{ isOfficial: true }, { isApproved: true }] },
};

/** MySQL: product IDs whose tags JSON (stored as text) contains the search term (case-insensitive). */
async function getProductIdsByTagSearch(term: string): Promise<string[]> {
  const t = term?.trim();
  if (!t) return [];
  const escaped = t.replace(/%/g, '\\%').replace(/_/g, '\\_');
  const like = `%${escaped}%`;
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p.id FROM Product p
    INNER JOIN Store s ON p.storeId = s.id
    WHERE (s.isOfficial = 1 OR s.isApproved = 1) AND p.isActive = 1
      AND LOWER(CAST(p.tags AS CHAR)) LIKE LOWER(${like})
  `;
  return rows.map((r) => r.id);
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true, ...storeVisibleWhere },
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
    where: { isActive: true, ...storeVisibleWhere },
    include: {
      store: { select: { name: true, slug: true, isOfficial: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getNewArrivalsProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isNewArrival: true, ...storeVisibleWhere },
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
    where: { isActive: true, store: { isOfficial: true, isApproved: true } },
    include: {
      store: { select: { name: true, slug: true, isOfficial: true } },
      category: { select: { name: true, slug: true } },
    },
    take: limit,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true, ...storeVisibleWhere },
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
      ...storeVisibleWhere,
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

/** Categories that have at least one active product from approved/official stores (for search suggestions). */
export async function getCategoriesWithProducts() {
  const categories = await prisma.category.findMany({
    where: {
      products: {
        some: {
          isActive: true,
          store: { OR: [{ isOfficial: true }, { isApproved: true }] },
        },
      },
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
  newArrivals?: boolean; // only products marked as New Arrival
  featured?: boolean;   // only products marked as Featured
};

export async function getProducts(filters: ProductListFilters = {}) {
  const { category, minPrice, maxPrice, search, sort = 'newest', page = 1, perPage = 12, newArrivals, featured } = filters;
  const skip = (page - 1) * perPage;

  const where: Prisma.ProductWhereInput = { isActive: true, ...storeVisibleWhere };
  if (newArrivals) where.isNewArrival = true;
  if (featured) where.isFeatured = true;
  if (category) {
    const cat = await prisma.category.findFirst({
      where: { slug: category },
      include: { children: { select: { id: true } } },
    });
    if (cat) {
      const categoryIds = [cat.id, ...cat.children.map((ch) => ch.id)];
      where.categoryId = categoryIds.length > 1 ? { in: categoryIds } : cat.id;
    }
  }
  if (minPrice != null || maxPrice != null) {
    where.price = {};
    if (minPrice != null) (where.price as Prisma.DecimalNullableFilter).gte = minPrice;
    if (maxPrice != null) (where.price as Prisma.DecimalNullableFilter).lte = maxPrice;
  }
  if (search?.trim()) {
    const q = search.trim();
    const tagIds = await getProductIdsByTagSearch(q);
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      ...(q.length >= 2 ? [{ sku: { contains: q } }] : []),
      ...(tagIds.length > 0 ? [{ id: { in: tagIds } }] : []),
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
  const term = q?.trim();
  if (!term) return [];
  const tagIds = await getProductIdsByTagSearch(term);
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...storeVisibleWhere,
      OR: [
        { title: { contains: term } },
        { description: { contains: term } },
        ...(term.length >= 2 ? [{ sku: { contains: term } }] : []),
        ...(tagIds.length > 0 ? [{ id: { in: tagIds } }] : []),
      ],
    },
    select: { id: true, title: true, slug: true, price: true, images: true },
    take: limit,
  });
}
