'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { applyCoupon } from '@/actions/coupon.actions';

const shippingAddressMeta = (addr: { name: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string; phone?: string }) =>
  JSON.stringify(addr);

function computeDiscountAmount(
  couponResult: { discount?: number; fixedAmount?: number; code: string },
  subtotal: number
): number {
  if (couponResult.fixedAmount != null) return Math.min(couponResult.fixedAmount, subtotal);
  return (subtotal * (couponResult.discount ?? 0)) / 100;
}

export async function createCheckoutSession(params: {
  items: { productId: string; quantity: number; price: number; title: string }[];
  shippingAddress: { name: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string; phone?: string };
  couponCode?: string;
  shippingAmount?: number;
  taxAmount?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };
  if (params.items.length === 0) return { error: 'Cart is empty' };

  const productIds = params.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      store: { OR: [{ isOfficial: true }, { isApproved: true }] },
    },
    include: { store: true },
  });
  if (products.length === 0) return { error: 'No valid items to checkout. Remove items from unapproved stores.' };
  const storeIds = [...new Set(products.map((p) => p.storeId))];
  if (storeIds.length > 1) {
    return { error: 'Please checkout items from one store at a time. Split your cart or remove items from other stores.' };
  }

  let subtotal = 0;
  const lineItems: { price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }[] = [];
  for (const item of params.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) return { error: 'Invalid or out-of-stock item' };
    subtotal += item.price * item.quantity;
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: product.title },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    });
  }

  const storeId = products[0]!.storeId;
  let discountAmount = 0;
  let couponCodeToStore: string | null = null;
  if (params.couponCode?.trim()) {
    const couponRes = await applyCoupon(params.couponCode.trim(), subtotal, storeId);
    if (couponRes?.error) return { error: couponRes.error };
    if (couponRes && (couponRes.discount != null || couponRes.fixedAmount != null)) {
      discountAmount = computeDiscountAmount(couponRes, subtotal);
      couponCodeToStore = couponRes.code;
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `Discount (${couponRes.code})` },
          unit_amount: -Math.round(discountAmount * 100),
        },
        quantity: 1,
      });
    }
  }

  const shippingAmount = params.shippingAmount ?? 0;
  const taxAmount = params.taxAmount ?? 0;
  if (shippingAmount > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Shipping' },
        unit_amount: Math.round(shippingAmount * 100),
      },
      quantity: 1,
    });
  }
  if (taxAmount > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tax' },
        unit_amount: Math.round(taxAmount * 100),
      },
      quantity: 1,
    });
  }

  const successUrl = `${process.env.NEXTAUTH_URL}/order-confirmation/{CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${process.env.NEXTAUTH_URL}/cart`;

  const orderItemsJson = JSON.stringify(
    params.items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price }))
  );
  const metadata: Record<string, string> = {
    userId: session.user.id,
    storeId,
    orderItems: orderItemsJson,
    shippingAddress: shippingAddressMeta(params.shippingAddress),
  };
  if (couponCodeToStore) metadata.couponCode = couponCodeToStore;

  const { stripe } = await import('@/lib/stripe');
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: session.user.email ?? undefined,
    metadata,
  });

  return { url: checkoutSession.url ?? undefined };
}

/** Create order for Cash on Delivery (no Stripe). */
export async function createOrderCashOnDelivery(params: {
  items: { productId: string; quantity: number; price: number; title: string }[];
  shippingAddress: { name: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string; phone?: string };
  couponCode?: string;
  shippingAmount?: number;
  taxAmount?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };
  if (params.items.length === 0) return { error: 'Cart is empty' };

  const productIds = params.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      store: { OR: [{ isOfficial: true }, { isApproved: true }] },
    },
    include: { store: true },
  });
  if (products.length === 0) return { error: 'No valid items to checkout. Remove items from unapproved stores.' };
  const storeIds = [...new Set(products.map((p) => p.storeId))];
  if (storeIds.length > 1) {
    return { error: 'Please checkout items from one store at a time.' };
  }

  let subtotal = 0;
  for (const item of params.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) return { error: 'Invalid or out-of-stock item' };
    subtotal += item.price * item.quantity;
  }

  const storeId = products[0]!.storeId;
  let discountAmount = 0;
  let couponCodeToStore: string | null = null;
  if (params.couponCode?.trim()) {
    const couponRes = await applyCoupon(params.couponCode.trim(), subtotal, storeId);
    if (couponRes?.error) return { error: couponRes.error };
    if (couponRes && (couponRes.discount != null || couponRes.fixedAmount != null)) {
      discountAmount = computeDiscountAmount(couponRes, subtotal);
      couponCodeToStore = couponRes.code;
    }
  }
  const shipping = params.shippingAmount ?? 0;
  const tax = params.taxAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount + shipping + tax);
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      storeId,
      status: 'PENDING',
      subtotal,
      discount: discountAmount,
      total,
      couponCode: couponCodeToStore,
      shippingAddress: params.shippingAddress as unknown as object,
      orderItems: {
        create: params.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    },
  });
  if (couponCodeToStore) {
    await prisma.coupon.updateMany({
      where: { code: couponCodeToStore },
      data: { usedCount: { increment: 1 } },
    });
  }
  return { orderId: order.id };
}
