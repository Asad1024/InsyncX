'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type HomepageFeaturedCoupon = {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  discount: number;
  usesLeft: number | null; // null = unlimited
  expiresAt: Date | null;
  storeName: string | null; // null = platform-wide
  storeSlug: string | null;
};

/**
 * Apply a coupon by code.
 * - Platform coupons (storeId null) work for any store.
 * - Vendor/store coupons only work when orderStoreId (or store derived from productIds) matches the coupon's store.
 * Pass orderStoreId when you already have it (e.g. checkout actions), or productIds so we resolve the cart's store.
 */
const COUPON_ERROR_GENERIC = 'This coupon is not valid or has expired.';

export async function applyCoupon(code: string, subtotal?: number, orderStoreIdOrProductIds?: string | string[]) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim(), isActive: true },
  });
  if (!coupon) return { error: COUPON_ERROR_GENERIC };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { error: COUPON_ERROR_GENERIC };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { error: COUPON_ERROR_GENERIC };
  }

  let orderStoreId: string | undefined;
  let eligibleProductIds: string[] | undefined;

  if (typeof orderStoreIdOrProductIds === 'string') {
    orderStoreId = orderStoreIdOrProductIds;
  } else if (Array.isArray(orderStoreIdOrProductIds) && orderStoreIdOrProductIds.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: orderStoreIdOrProductIds } },
      select: { id: true, storeId: true },
    });
    const storeIds = Array.from(new Set(products.map((p) => p.storeId)));
    if (products.length === 0 || storeIds.length === 0) {
      return { error: COUPON_ERROR_GENERIC };
    }
    if (storeIds.length === 1) {
      orderStoreId = storeIds[0];
    } else {
      // Mixed-store cart: platform coupons apply to the whole cart; store coupons only to that store's lines.
      if (coupon.storeId == null) {
        orderStoreId = undefined;
        eligibleProductIds = undefined;
      } else {
        if (!storeIds.includes(coupon.storeId)) {
          return { error: 'This coupon does not apply to any items in your cart.' };
        }
        orderStoreId = coupon.storeId;
        eligibleProductIds = products.filter((p) => p.storeId === coupon.storeId).map((p) => p.id);
      }
    }
  }

  // Vendor coupon: only valid for that store's orders. Platform coupon (storeId null): valid for any store.
  if (coupon.storeId != null && orderStoreId != null && coupon.storeId !== orderStoreId) {
    return { error: COUPON_ERROR_GENERIC };
  }
  const extra = eligibleProductIds?.length ? { eligibleProductIds } : {};
  if (coupon.type === 'PERCENT') {
    const discount = Number(coupon.discount);
    return { discount, code: coupon.code, ...extra };
  }
  return { discount: 0, fixedAmount: Number(coupon.discount), code: coupon.code, ...extra };
}

export type CouponFormData = {
  code: string;
  type: 'PERCENT' | 'FIXED';
  discount: number;
  storeId?: string | null;
  usageLimit?: number | null;
  expiresAt?: string | null;
  isActive: boolean;
};

export async function createCoupon(data: CouponFormData): Promise<{ error?: string }> {
  const session = await auth();
  const code = data.code.toUpperCase().trim();
  if (!code) return { error: 'Code is required.' };
  if (data.discount <= 0) return { error: 'Discount must be greater than 0.' };
  if (data.type === 'PERCENT' && data.discount > 100) return { error: 'Percent discount cannot exceed 100.' };

  if (session?.user?.role === 'ADMIN') {
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) return { error: 'A coupon with this code already exists.' };
    await prisma.coupon.create({
      data: {
        code,
        type: data.type,
        discount: data.discount,
        storeId: data.storeId || null,
        usageLimit: data.usageLimit ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      },
    });
    revalidatePath('/admin/coupons');
    return {};
  }

  if (session?.user?.role === 'VENDOR') {
    const store = await prisma.store.findFirst({ where: { ownerId: session.user.id } });
    if (!store) return { error: 'No store found.' };
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) return { error: 'A coupon with this code already exists.' };
    await prisma.coupon.create({
      data: {
        code,
        type: data.type,
        discount: data.discount,
        storeId: store.id,
        usageLimit: data.usageLimit ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      },
    });
    revalidatePath('/vendor/coupons');
    return {};
  }

  return { error: 'Forbidden.' };
}

export async function updateCoupon(id: string, data: CouponFormData): Promise<{ error?: string }> {
  const session = await auth();
  const code = data.code.toUpperCase().trim();
  if (!code) return { error: 'Code is required.' };
  if (data.discount <= 0) return { error: 'Discount must be greater than 0.' };
  if (data.type === 'PERCENT' && data.discount > 100) return { error: 'Percent discount cannot exceed 100.' };

  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return { error: 'Coupon not found.' };

  if (session?.user?.role === 'ADMIN') {
    if (coupon.code !== code) {
      const existing = await prisma.coupon.findUnique({ where: { code } });
      if (existing) return { error: 'A coupon with this code already exists.' };
    }
    await prisma.coupon.update({
      where: { id },
      data: {
        code,
        type: data.type,
        discount: data.discount,
        storeId: data.storeId ?? coupon.storeId,
        usageLimit: data.usageLimit ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      },
    });
    revalidatePath('/admin/coupons');
    return {};
  }

  if (session?.user?.role === 'VENDOR') {
    const store = await prisma.store.findFirst({ where: { ownerId: session.user.id } });
    if (!store || coupon.storeId !== store.id) return { error: 'Coupon not found.' };
    if (coupon.code !== code) {
      const existing = await prisma.coupon.findUnique({ where: { code } });
      if (existing) return { error: 'A coupon with this code already exists.' };
    }
    await prisma.coupon.update({
      where: { id },
      data: {
        code,
        type: data.type,
        discount: data.discount,
        usageLimit: data.usageLimit ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      },
    });
    revalidatePath('/vendor/coupons');
    return {};
  }

  return { error: 'Forbidden.' };
}

export async function deleteCoupon(id: string): Promise<{ error?: string }> {
  const session = await auth();
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return { error: 'Coupon not found.' };

  if (session?.user?.role === 'ADMIN') {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath('/admin/coupons');
    return {};
  }

  if (session?.user?.role === 'VENDOR') {
    const store = await prisma.store.findFirst({ where: { ownerId: session.user.id } });
    if (!store || coupon.storeId !== store.id) return { error: 'Coupon not found.' };
    await prisma.coupon.delete({ where: { id } });
    revalidatePath('/vendor/coupons');
    return {};
  }

  return { error: 'Forbidden.' };
}

/** Homepage: featured coupons from platform settings. Only returns active, non-expired coupons with uses left. */
export async function getHomepageFeaturedCoupons(): Promise<HomepageFeaturedCoupon[]> {
  const settings = await prisma.platformSettings.findFirst({ where: { id: 'default' } });
  const enabled = settings?.homepageCouponSectionEnabled === true;
  const rawIds = settings?.featuredCouponIds;
  const ids = Array.isArray(rawIds) ? (rawIds as string[]) : [];
  if (!enabled || ids.length === 0) return [];

  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      id: { in: ids },
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: { store: { select: { name: true, slug: true } } },
  });
  const valid = coupons.filter((c) => c.usageLimit == null || c.usedCount < c.usageLimit);
  return valid.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    discount: Number(c.discount),
    usesLeft: c.usageLimit != null ? Math.max(0, c.usageLimit - c.usedCount) : null,
    expiresAt: c.expiresAt,
    storeName: c.store?.name ?? null,
    storeSlug: c.store?.slug ?? null,
  }));
}
