'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function createCheckoutSession(params: {
  items: { productId: string; quantity: number; price: number; title: string }[];
  shippingAddress: { name: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string };
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };
  if (params.items.length === 0) return { error: 'Cart is empty' };

  const productIds = params.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { store: true },
  });
  const storeIds = [...new Set(products.map((p) => p.storeId))];
  if (storeIds.length > 1) {
    return { error: 'Please checkout items from one store at a time. Split your cart or remove items from other stores.' };
  }

  const lineItems: { price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }[] = [];
  for (const item of params.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) return { error: 'Invalid or out-of-stock item' };
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
  const successUrl = `${process.env.NEXTAUTH_URL}/order-confirmation/{CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${process.env.NEXTAUTH_URL}/cart`;

  const orderItemsJson = JSON.stringify(
    params.items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price }))
  );
  const { stripe } = await import('@/lib/stripe');
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: session.user.email ?? undefined,
    metadata: {
      userId: session.user.id,
      storeId,
      orderItems: orderItemsJson,
    },
    shipping_address_collection: { allowed_countries: ['US'] },
  });

  return { url: checkoutSession.url ?? undefined };
}

/** Create order for Cash on Delivery (no Stripe). */
export async function createOrderCashOnDelivery(params: {
  items: { productId: string; quantity: number; price: number; title: string }[];
  shippingAddress: { name: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string };
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };
  if (params.items.length === 0) return { error: 'Cart is empty' };

  const productIds = params.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { store: true },
  });
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
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      storeId,
      status: 'PENDING',
      subtotal,
      discount: 0,
      total: subtotal,
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

  return { orderId: order.id };
}
