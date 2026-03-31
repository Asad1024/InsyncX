'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function approveVendorStore(storeId: string): Promise<{ success?: true; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden' };
  try {
    await prisma.store.update({
      where: { id: storeId },
      data: { isApproved: true, declinedAt: null, declineReason: null },
    });
  } catch (e) {
    console.error('approveVendorStore', e);
    return { error: 'Failed to approve store. Please try again.' };
  }
  revalidatePath('/admin/vendors');
  revalidatePath(`/admin/vendors/${storeId}`);
  revalidatePath('/vendor');
  revalidatePath('/vendor/store');
  revalidatePath('/');
  revalidatePath('/shop');
  return { success: true };
}

export async function declineVendorStore(storeId: string, reason?: string): Promise<{ success?: true; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden' };
  try {
    await prisma.store.update({
      where: { id: storeId },
      data: {
        isApproved: false,
        declinedAt: new Date(),
        declineReason: reason?.trim().slice(0, 500) ?? null,
      },
    });
  } catch (e) {
    console.error('declineVendorStore', e);
    return { error: 'Failed to decline store. Please try again.' };
  }
  revalidatePath('/admin/vendors');
  revalidatePath(`/admin/vendors/${storeId}`);
  revalidatePath('/vendor');
  revalidatePath('/vendor/store');
  return { success: true };
}

/** Delete a user and all their related data (stores, orders, cart, wishlist, reviews). Cascades via Prisma. */
export async function deleteUser(userId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden' };
  if (session.user.id === userId) return { error: 'You cannot delete your own account' };
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: 'User not found' };
  if (target.role === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount <= 1) return { error: 'Cannot delete the last admin' };
  }
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath('/admin/users');
  revalidatePath('/admin');
  return {};
}

/** Update platform commission % (Admin only). Saved in DB and used for revenue calculations. */
export async function updateCommissionPercent(commissionPercent: number): Promise<{ error?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden' };
  const value = Math.min(100, Math.max(0, Math.round(commissionPercent)));
  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', commissionPercent: value, maintenanceMode: false },
    update: { commissionPercent: value },
  });
  revalidatePath('/admin/settings');
  revalidatePath('/admin');
  revalidatePath('/vendor');
  return {};
}

/** Update homepage coupon section (Admin only). */
export async function updateHomepageCouponSection(
  enabled: boolean,
  couponIds: string[]
): Promise<{ error?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden' };
  const ids = Array.isArray(couponIds) ? couponIds.filter((id) => typeof id === 'string') : [];
  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      commissionPercent: 10,
      maintenanceMode: false,
      homepageCouponSectionEnabled: enabled,
      featuredCouponIds: ids,
    },
    update: {
      homepageCouponSectionEnabled: enabled,
      featuredCouponIds: ids,
    },
  });
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return {};
}

/** Update platform display settings: currency, shipping, tax (Admin only). */
export async function updatePlatformDisplaySettings(params: {
  currencySymbol: string;
  freeShippingThreshold: number | null;
  shippingCharge: number | null;
  taxEnabled: boolean;
  taxRatePercent: number | null;
}): Promise<{ error?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden' };
  const symbol = (params.currencySymbol ?? '$').trim().slice(0, 10) || '$';
  const freeShip = params.freeShippingThreshold != null ? Math.max(0, params.freeShippingThreshold) : null;
  const shipping = params.shippingCharge != null ? Math.max(0, params.shippingCharge) : null;
  const taxRate = params.taxEnabled && params.taxRatePercent != null
    ? Math.min(100, Math.max(0, params.taxRatePercent))
    : null;
  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      commissionPercent: 10,
      maintenanceMode: false,
      currencySymbol: symbol,
      freeShippingThreshold: freeShip,
      shippingCharge: shipping,
      taxEnabled: params.taxEnabled ?? false,
      taxRatePercent: taxRate,
    },
    update: {
      currencySymbol: symbol,
      freeShippingThreshold: freeShip,
      shippingCharge: shipping,
      taxEnabled: params.taxEnabled ?? false,
      taxRatePercent: taxRate,
    },
  });
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return {};
}
