'use server';

import { prisma } from '@/lib/prisma';

export async function subscribeNewsletter(email: string) {
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });
  if (existing) return { error: 'Already subscribed.' };
  await prisma.newsletterSubscriber.create({
    data: { email },
  });
  return { success: true };
}
