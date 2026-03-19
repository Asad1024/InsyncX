'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@prisma/client';

export async function createOrder(params: {
  storeId: string;
  items: { productId: string; quantity: number; price: number }[];
  shippingAddress: object;
  couponCode?: string | null;
  discount: number;
  stripeSessionId?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };

  const subtotal = params.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - params.discount);

  const order = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId: session.user.id,
        storeId: params.storeId,
        status: 'PENDING',
        subtotal,
        discount: params.discount,
        total,
        shippingAddress: params.shippingAddress as object,
        couponCode: params.couponCode ?? null,
        stripeSessionId: params.stripeSessionId ?? null,
      },
    });
    for (const item of params.items) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        },
      });
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    return order;
  });

  revalidatePath('/account/orders');
  return { orderId: order.id };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  actor: 'vendor' | 'admin'
) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: true },
  });
  if (!order) return { error: 'Order not found' };

  if (actor === 'vendor') {
    if (session.user.role !== 'ADMIN' && order.store.ownerId !== session.user.id) {
      return { error: 'Not your order' };
    }
  }
  if (actor === 'admin' && session.user.role !== 'ADMIN') return { error: 'Forbidden' };

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  revalidatePath('/vendor/orders');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/account/orders/${orderId}`);
  return { success: true };
}

export async function getOrderById(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: { include: { product: true } },
      store: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!order) return null;
  if (session.user.role !== 'ADMIN' && order.store.ownerId !== session.user.id && order.userId !== session.user.id) {
    return null;
  }
  return order;
}

export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { store: true },
    orderBy: { createdAt: 'desc' },
  });
}
