'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@prisma/client';
import { slugify, uniqueSlug } from '@/lib/utils';

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'VENDOR';
  phone?: string;
  storeName?: string;
  storeSlug?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: params.email },
  });
  if (existing) return { error: 'Email already registered.' };

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(params.password, salt);
  const phone = params.phone?.trim() || null;

  if (params.role === 'VENDOR' && (params.storeName ?? params.storeSlug)) {
    const slug = params.storeSlug?.trim() || slugify(params.storeName!);
    const unique = await ensureUniqueStoreSlug(slug);
    const user = await prisma.user.create({
      data: {
        name: params.name,
        email: params.email,
        password: hashedPassword,
        role: 'VENDOR',
        authProvider: 'credentials',
        phone,
      },
    });
    await prisma.store.create({
      data: {
        name: params.storeName || unique,
        slug: unique,
        ownerId: user.id,
        isApproved: false,
        isActive: true,
      },
    });
    revalidatePath('/');
    return { success: true };
  }

  await prisma.user.create({
    data: {
      name: params.name,
      email: params.email,
      password: hashedPassword,
      role: 'CUSTOMER',
      authProvider: 'credentials',
      phone,
    },
  });
  revalidatePath('/');
  return { success: true };
}

async function ensureUniqueStoreSlug(base: string): Promise<string> {
  const existing = await prisma.store.findUnique({ where: { slug: base } });
  if (!existing) return base;
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function updateProfile(userId: string, data: { name?: string; avatar?: string }) {
  await prisma.user.update({
    where: { id: userId },
    data: { name: data.name, avatar: data.avatar },
  });
  revalidatePath('/account');
  revalidatePath('/account/profile');
}

export async function getMe(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, avatar: true, phone: true },
  });
}

export type DefaultAddressShape = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
};

/** For checkout prefill: phone + default address if saved. */
export async function getCheckoutPrefill(): Promise<{ phone: string; defaultAddress: DefaultAddressShape | null }> {
  const session = await auth();
  if (!session?.user?.id) return { phone: '', defaultAddress: null };
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true, defaultAddress: true },
  });
  const defaultAddress = user?.defaultAddress && typeof user.defaultAddress === 'object' && user.defaultAddress !== null
    ? (user.defaultAddress as DefaultAddressShape)
    : null;
  return {
    phone: user?.phone ?? '',
    defaultAddress,
  };
}

/** Save default shipping address and phone for checkout prefill. */
export async function saveDefaultAddress(
  address: DefaultAddressShape,
  phone?: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      defaultAddress: address as unknown as object,
      phone: phone?.trim() || (address.phone?.trim()) || null,
    },
  });
  revalidatePath('/checkout');
  return {};
}

export async function getWishlistProductIds(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const rows = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return rows.map((r) => r.productId);
}

export async function addToWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Sign in to add to wishlist' };
  try {
    await prisma.wishlist.create({
      data: { userId: session.user.id, productId },
    });
  } catch (e: unknown) {
    const prismaError = e as { code?: string };
    if (prismaError.code === 'P2002') return {}; // already in wishlist
    throw e;
  }
  revalidatePath('/account/wishlist');
  revalidatePath('/account');
  return {};
}

export async function removeFromWishlist(userId: string, productId: string) {
  await prisma.wishlist.deleteMany({
    where: { userId, productId },
  });
  revalidatePath('/account/wishlist');
  revalidatePath('/account');
}

export async function clearWishlist(userId: string) {
  await prisma.wishlist.deleteMany({ where: { userId } });
  revalidatePath('/account/wishlist');
  revalidatePath('/account');
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: 'User not found' };
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return { error: 'Current password is incorrect' };
  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(newPassword, salt);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
  revalidatePath('/account/profile');
  return { success: true };
}

/** Set password for user who signed up via Google (needsPassword flow). */
export async function setPasswordAfterGoogle(userId: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: 'User not found' };
  if (!user.needsPassword) return { error: 'Password already set' };
  if (newPassword.length < 8) return { error: 'Password must be at least 8 characters' };
  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(newPassword, salt);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed, needsPassword: false },
  });
  revalidatePath('/');
  return { success: true };
}
