import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature');
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook secret missing', { status: 400 });
  }
  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET) as unknown as typeof event;
  } catch (err) {
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      id: string;
      metadata?: { userId?: string; storeId?: string; orderItems?: string; shippingAddress?: string; couponCode?: string };
      amount_total?: number;
    };
    const userId = session.metadata?.userId;
    const storeId = session.metadata?.storeId;
    const orderItemsRaw = session.metadata?.orderItems;
    if (!userId || !storeId || !orderItemsRaw) {
      return new Response('OK', { status: 200 });
    }
    let orderItems: { productId: string; quantity: number; price: number }[];
    try {
      orderItems = JSON.parse(orderItemsRaw) as { productId: string; quantity: number; price: number }[];
    } catch {
      return new Response('OK', { status: 200 });
    }
    let shippingAddress: object = {};
    try {
      if (session.metadata?.shippingAddress) {
        shippingAddress = JSON.parse(session.metadata.shippingAddress) as object;
      }
    } catch {
      // ignore
    }
    const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = (session.amount_total ?? Math.round(subtotal * 100)) / 100;
    const discount = Math.max(0, subtotal - total);
    const couponCode = session.metadata?.couponCode ?? null;
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          storeId,
          status: 'CONFIRMED',
          subtotal,
          discount,
          total,
          couponCode,
          shippingAddress,
          stripeSessionId: session.id,
        },
      });
      for (const oi of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: oi.productId,
            quantity: oi.quantity,
            price: oi.price,
          },
        });
        await tx.product.update({
          where: { id: oi.productId },
          data: { stock: { decrement: oi.quantity } },
        });
      }
      if (couponCode) {
        await tx.coupon.updateMany({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }
    });
  }

  return new Response('OK', { status: 200 });
}
