'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateStore(
  storeId: string,
  data: { name?: string; slug?: string; description?: string; logo?: string; banner?: string }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return { error: 'Store not found' };
  if (store.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }
  await prisma.store.update({
    where: { id: storeId },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      logo: data.logo,
      banner: data.banner,
    },
  });
  revalidatePath('/vendor/store');
  revalidatePath(`/store/${store.slug}`);
  return { success: true };
}

/** Vendor: clear declined state and put store back in pending for admin review. */
export async function requestApprovalAgain(storeId: string): Promise<{ success?: true; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in' };
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return { error: 'Store not found' };
  if (store.ownerId !== session.user.id) return { error: 'Forbidden' };
  if (!store.declinedAt) return { error: 'Store is not declined.' };
  await prisma.store.update({
    where: { id: storeId },
    data: { declinedAt: null, declineReason: null },
  });
  revalidatePath('/vendor/store');
  revalidatePath('/admin/vendors');
  return { success: true };
}
