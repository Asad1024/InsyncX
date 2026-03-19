'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@prisma/client';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED'],
  CANCELLED: [],
  RETURN_REQUESTED: ['RETURN_APPROVED', 'RETURN_REJECTED'],
  RETURN_APPROVED: ['RETURNED'],
  RETURN_REJECTED: [],
  RETURNED: [],
};

function canTransition(current: OrderStatus, next: OrderStatus) {
  return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

function shouldRestock(current: OrderStatus, next: OrderStatus) {
  return (
    (next === 'CANCELLED' && (current === 'PENDING' || current === 'CONFIRMED')) ||
    (next === 'RETURNED' && current === 'RETURN_APPROVED')
  );
}

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
  actor: 'vendor' | 'admin' | 'customer'
) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: true, orderItems: true },
  });
  if (!order) return { error: 'Order not found' };

  if (actor === 'vendor') {
    if (session.user.role !== 'ADMIN' && order.store.ownerId !== session.user.id) {
      return { error: 'Not your order' };
    }
  }
  if (actor === 'admin' && session.user.role !== 'ADMIN') return { error: 'Forbidden' };
  if (actor === 'customer' && order.userId !== session.user.id) return { error: 'Not your order' };

  if (!canTransition(order.status, status)) {
    return { error: `Cannot move order from ${order.status.replace('_', ' ')} to ${status.replace('_', ' ')}` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status },
    });

    if (shouldRestock(order.status, status)) {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });

  revalidatePath('/vendor/orders');
  revalidatePath(`/vendor/orders/${orderId}`);
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/account/orders');
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
      user: { select: { name: true, email: true, phone: true } },
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
    include: {
      store: true,
      orderItems: { include: { product: { select: { title: true, images: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
