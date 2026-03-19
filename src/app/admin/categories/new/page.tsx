import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { prisma } from '@/lib/prisma';

export default async function NewCategoryPage() {
  const parentCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div>
      <PageHeader
        title="New category"
        subtitle="Add a product category"
        actions={<Link href="/admin/categories" className="btn btn-ghost btn-sm">Back</Link>}
      />
      <CategoryForm parentCategories={parentCategories} />
    </div>
  );
}
