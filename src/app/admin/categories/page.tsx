import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/PageHeader';
import { ListSearchFilter } from '@/components/shared/ListSearchFilter';
import { Pencil } from 'lucide-react';

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = '' } = await searchParams;
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: { include: { _count: { select: { products: true } } } },
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  const q = search.trim().toLowerCase();
  const match = (name: string, slug: string) => !q || name.toLowerCase().includes(q) || slug.toLowerCase().includes(q);
  const parentIds = new Set<string>();
  const childIds = new Set<string>();
  if (q) {
    categories.forEach((c) => {
      if (match(c.name, c.slug)) parentIds.add(c.id);
      c.children.forEach((ch) => {
        if (match(ch.name, ch.slug)) {
          childIds.add(ch.id);
          parentIds.add(c.id); // show parent if child matches
        }
      });
    });
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage product categories"
        actions={
          <Link href="/admin/categories/new" className="btn btn-primary rounded-xl px-5 py-2.5 font-sans text-[14px] font-semibold bg-[var(--gold)] text-white hover:opacity-90">
            Add category
          </Link>
        }
      />
      <ListSearchFilter basePath="/admin/categories" placeholder="Search by name or slug…" currentSearch={search} />
      {categories.length === 0 ? (
        <div className="panel py-16 px-6 text-center mt-8">
          <p className="font-display text-[28px] font-light" style={{ color: 'var(--text-3)' }}>No categories</p>
          <Link href="/admin/categories/new" className="btn btn-primary rounded-xl px-5 py-2.5 mt-4 inline-block">Add category</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
          {categories.filter((c) => !q || parentIds.has(c.id)).map((c) => (
            <div key={c.id} className="panel overflow-hidden p-0 flex flex-col">
              <Link href={`/admin/categories/${c.id}`} className="block flex-1">
                <div
                  className="aspect-[4/3] w-full relative"
                  style={{ background: 'var(--surface2)' }}
                >
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-[48px] font-light select-none" style={{ color: 'var(--text-4)' }}>
                        {c.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-[18px] font-medium" style={{ color: 'var(--text)' }}>{c.name}</h3>
                  <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>/{c.slug}</p>
                  <p className="font-sans text-[13px] mt-2" style={{ color: 'var(--text-3)' }}>
                    {c._count.products} product{c._count.products !== 1 ? 's' : ''}
                    {c.children.length > 0 && ` · ${c.children.length} sub`}
                  </p>
                </div>
              </Link>
              <div className="px-4 pb-4 flex gap-2">
                <Link
                  href={`/admin/categories/${c.id}`}
                  className="inline-flex items-center gap-1.5 btn btn-ghost btn-sm rounded-xl px-3 py-2 font-sans text-[13px]"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
              </div>
            </div>
          ))}
          {categories.flatMap((c) => c.children).filter((child) => !q || childIds.has(child.id)).map((child) => (
            <div key={child.id} className="panel overflow-hidden p-0 flex flex-col">
              <Link href={`/admin/categories/${child.id}`} className="block flex-1">
                <div
                  className="aspect-[4/3] w-full relative"
                  style={{ background: 'var(--surface2)' }}
                >
                  {child.image ? (
                    <Image
                      src={child.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-[48px] font-light select-none" style={{ color: 'var(--text-4)' }}>
                        {child.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-[18px] font-medium" style={{ color: 'var(--text)' }}>{child.name}</h3>
                  <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>/{child.slug}</p>
                  <p className="font-sans text-[13px] mt-2" style={{ color: 'var(--text-3)' }}>
                    {child._count.products} product{child._count.products !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <Link
                  href={`/admin/categories/${child.id}`}
                  className="inline-flex items-center gap-1.5 btn btn-ghost btn-sm rounded-xl px-3 py-2 font-sans text-[13px]"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
