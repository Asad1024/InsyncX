'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function approveVendorStore(storeId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden' };
  await prisma.store.update({
    where: { id: storeId },
    data: { isApproved: true },
  });
  revalidatePath('/admin/vendors');
  revalidatePath('/vendor');
  return { success: true };
}
