import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pencil } from 'lucide-react';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true, _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage product categories"
        actions={
          <Link href="/admin/categories/new" className="btn btn-primary">
            Add Category
          </Link>
        }
      />
      <div className="card overflow-hidden">
        {categories.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <p className="font-display text-[28px] font-light" style={{ color: 'var(--text-3)' }}>No categories</p>
          </div>
        ) : (
          <ul>
            {categories.map((c) => (
              <li key={c.id} className="group">
                <div
                  className="flex items-center justify-between py-3.5 px-5 border-b"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-[14px] font-medium" style={{ color: 'var(--text)' }}>{c.name}</span>
                    <span className="font-sans text-[12px]" style={{ color: 'var(--text-4)' }}>({c._count.products})</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/categories/${c.id}`} className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}>
                      <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
                    </Link>
                  </div>
                </div>
                {c.children.length > 0 && (
                  <ul className="border-l-2 ml-5 pl-5" style={{ borderColor: 'var(--line)' }}>
                    {c.children.map((child) => (
                      <li
                        key={child.id}
                        className="flex items-center justify-between py-3.5 px-5 border-b"
                        style={{ borderColor: 'var(--line)' }}
                      >
                        <span className="font-sans text-[14px] font-medium" style={{ color: 'var(--text)' }}>{child.name}</span>
                        <span className="font-sans text-[12px]" style={{ color: 'var(--text-4)' }}>/{child.slug}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
