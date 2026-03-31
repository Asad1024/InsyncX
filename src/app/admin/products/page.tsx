import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ListSearchFilter } from '@/components/shared/ListSearchFilter';
import { Plus, Pencil, Star } from 'lucide-react';

function getFirstImage(images: unknown): string | null {
  if (Array.isArray(images) && images[0]) return images[0] as string;
  return null;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { search = '', category } = await searchParams;
  const [productsRaw, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        store: { select: { name: true, slug: true, isOfficial: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  let products = productsRaw;
  if (category) {
    products = products.filter((p) => p.category.id === category);
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q)) ||
        p.store.name.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q)
    );
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="All products across platform stores"
        actions={
          <Link href="/admin/products/new" className="btn btn-primary rounded-xl px-5 py-2.5 font-sans text-[14px] font-semibold bg-[var(--gold)] text-white hover:opacity-90">
            <Plus className="w-4 h-4" />
            Add product
          </Link>
        }
      />
      <ListSearchFilter
        basePath="/admin/products"
        placeholder="Search by title, SKU, store, category…"
        currentSearch={search}
        filters={[
          {
            param: 'category',
            label: 'All categories',
            options: categories.map((c) => ({ value: c.id, label: c.name })),
          },
        ]}
        currentFilters={category ? { category } : {}}
      />
      <div className="panel overflow-hidden mt-8">
      <DataTable empty={products.length === 0} emptyTitle="No products">
        <table className="w-full border-collapse">
          <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Product</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Store</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Category</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Price</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Stock</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const img = getFirstImage(p.images);
              return (
                <tr key={p.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--surface3)]">
                        {img ? <Image src={img} alt="" width={40} height={48} className="object-cover w-full h-full" /> : null}
                      </div>
                      <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--text)' }}>{p.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-sans text-[12px]" style={{ color: 'var(--text-3)' }}>{p.store.name}</span>
                    {p.store.isOfficial && <span className="badge badge-gold-outline ml-1 text-[9px]">Official</span>}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{p.category.name}</td>
                  <td className="py-3.5 px-4 font-sans text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{formatPrice(Number(p.price))}</td>
                  <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{p.stock}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center" title={p.isFeatured ? 'Featured' : 'Not featured'}>
                        <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-[var(--gold)]' : ''}`} style={{ color: p.isFeatured ? 'var(--gold)' : 'var(--text-4)' }} />
                      </span>
                      <Link href={`/admin/products/${p.id}`} className="btn btn-ghost btn-sm">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTable>
      </div>
    </div>
  );
}
