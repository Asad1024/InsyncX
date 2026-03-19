'use server';

import { prisma } from '@/lib/prisma';

export async function applyCoupon(code: string, subtotal?: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim(), isActive: true },
  });
  if (!coupon) return { error: 'Invalid or expired coupon.' };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { error: 'Coupon expired.' };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { error: 'Coupon limit reached.' };
  }
  if (coupon.type === 'PERCENT') {
    const discount = Number(coupon.discount);
    return { discount, code: coupon.code };
  }
  return { discount: 0, fixedAmount: Number(coupon.discount), code: coupon.code };
}
