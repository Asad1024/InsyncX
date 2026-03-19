import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/PageHeader';
import { CategoryForm } from '@/components/admin/CategoryForm';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await auth();
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();
  const parentCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div>
      <PageHeader
        title="Edit category"
        subtitle="Fill in the details below"
        actions={<Link href="/admin/categories" className="btn btn-ghost btn-sm">Back</Link>}
      />
      <div className="grid gap-8 items-start" style={{ gridTemplateColumns: '60% 1fr' }}>
        <div>
          <CategoryForm
            categoryId={category.id}
            parentCategories={parentCategories}
            initial={{
              name: category.name,
              slug: category.slug,
              image: category.image ?? null,
              parentId: category.parentId,
            }}
          />
        </div>
        <div className="sticky top-20 space-y-4">
          <div className="card card-p mb-4">
            <h2 className="font-display text-[20px] font-normal mb-4" style={{ color: 'var(--text)' }}>
              Publish
            </h2>
            <p className="font-sans text-[13px] mb-5" style={{ color: 'var(--text-3)' }}>
              Use the form to set status and submit.
            </p>
          </div>
          <div className="card overflow-hidden">
            <div className="py-3.5 px-4 border-b" style={{ borderColor: 'var(--line)' }}>
              <p className="font-sans text-[11px] uppercase" style={{ color: 'var(--text-4)' }}>Preview</p>
            </div>
            <div className="p-0">
              <div className="panel overflow-hidden p-0 flex flex-col">
                <div
                  className="aspect-[4/3] w-full relative"
                  style={{ background: 'var(--surface2)' }}
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-[48px] font-light select-none" style={{ color: 'var(--text-4)' }}>
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-[18px] font-medium" style={{ color: 'var(--text)' }}>{category.name}</h3>
                  <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>/{category.slug}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
