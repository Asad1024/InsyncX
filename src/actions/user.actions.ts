'use server';

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
  storeName?: string;
  storeSlug?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: params.email },
  });
  if (existing) return { error: 'Email already registered.' };

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(params.password, salt);

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
    select: { id: true, name: true, email: true, role: true, avatar: true },
  });
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
