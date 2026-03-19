'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getDbCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              images: true,
            },
          },
        },
      },
    },
  });
  if (!cart) return [];
  return cart.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    title: item.product.title,
    slug: item.product.slug,
    price: Number(item.product.price),
    image: Array.isArray(item.product.images)
      ? (item.product.images[0] as string)
      : (JSON.parse(String(item.product.images))?.[0] as string),
  }));
}

export async function syncCartToDb(userId: string, items: { productId: string; quantity: number }[]) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  if (items.length > 0) {
    const validIds = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
      select: { id: true },
    });
    const validSet = new Set(validIds.map((p) => p.id));
    const validItems = items.filter((i) => validSet.has(i.productId));
    if (validItems.length > 0) {
      await prisma.cartItem.createMany({
        data: validItems.map((i) => ({ cartId: cart.id, productId: i.productId, quantity: i.quantity })),
      });
    }
  }
  revalidatePath('/cart');
  revalidatePath('/');
}

export async function addToCartDb(productId: string, quantity: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not logged in' };
  let cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: true },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: session.user.id },
      include: { items: true },
    });
  }
  const existing = cart.items.find((i) => i.productId === productId);
  const newQty = (existing ? existing.quantity : 0) + quantity;
  if (newQty <= 0) return { error: 'Invalid quantity' };

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }
  revalidatePath('/cart');
  revalidatePath('/');
  return { success: true };
}

export async function updateCartItemDb(productId: string, quantity: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not logged in' };
  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: true },
  });
  if (!cart) return { error: 'No cart' };
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) return { error: 'Item not in cart' };
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  }
  revalidatePath('/cart');
  return { success: true };
}

export async function removeFromCartDb(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not logged in' };
  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: true },
  });
  const item = cart?.items.find((i) => i.productId === productId);
  if (item) await prisma.cartItem.delete({ where: { id: item.id } });
  revalidatePath('/cart');
  return { success: true };
}
