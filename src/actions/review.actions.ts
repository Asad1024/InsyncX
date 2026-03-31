'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addReview(params: {
  productId: string;
  rating: number;
  comment?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Sign in to review.' };
  if (params.rating < 1 || params.rating > 5) return { error: 'Rating must be 1–5.' };

  await prisma.review.upsert({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: params.productId,
      },
    },
    create: {
      userId: session.user.id,
      productId: params.productId,
      rating: params.rating,
      comment: params.comment?.trim() || null,
    },
    update: {
      rating: params.rating,
      comment: params.comment?.trim() || null,
    },
  });
  revalidatePath(`/product/[slug]`, 'page');
  return { success: true };
}
