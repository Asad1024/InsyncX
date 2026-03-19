'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';

export async function createCategory(params: {
  name: string;
  slug?: string;
  image?: string;
  icon?: string;
  parentId?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') return { error: 'Forbidden' };
  const baseSlug = params.slug?.trim() || slugify(params.name);
  const slug = baseSlug
    ? await (async () => {
        let s = baseSlug;
        let n = 0;
        while (await prisma.category.findUnique({ where: { slug: s } })) {
          s = `${baseSlug}-${++n}`;
        }
        return s;
      })()
    : slugify(params.name) + '-' + Math.random().toString(36).slice(2, 8);
  await prisma.category.create({
    data: {
      name: params.name.trim(),
      slug,
      image: params.image ?? null,
      icon: params.icon ?? null,
      parentId: params.parentId || null,
    },
  });
  revalidatePath('/admin/categories');
  revalidatePath('/shop');
  return { success: true };
}

export async function updateCategory(
  categoryId: string,
  params: { name?: string; slug?: string; image?: string; icon?: string; parentId?: string | null }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') return { error: 'Forbidden' };
  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) return { error: 'Category not found' };
  let slug = params.slug !== undefined ? params.slug.trim() : existing.slug;
  if (slug && slug !== existing.slug) {
    let s = slug;
    let n = 0;
    while (await prisma.category.findFirst({ where: { slug: s, id: { not: categoryId } } })) {
      s = `${slug}-${++n}`;
    }
    slug = s;
  }
  await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(params.name !== undefined && { name: params.name.trim() }),
      ...(params.slug !== undefined && { slug: slug || existing.slug }),
      ...(params.image !== undefined && { image: params.image || null }),
      ...(params.icon !== undefined && { icon: params.icon || null }),
      ...(params.parentId !== undefined && { parentId: params.parentId ?? null }),
    },
  });
  revalidatePath('/admin/categories');
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath('/shop');
  return { success: true };
}
