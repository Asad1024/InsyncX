import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { VendorProductFilters } from '@/components/vendor/VendorProductFilters';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';

export default async function VendorProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; category?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const store = await prisma.store.findFirst({
    where: session.user.role === 'ADMIN' && (session.user as { storeId?: string }).storeId
      ? { id: (session.user as { storeId: string }).storeId }
      : { ownerId: session.user.id },
  });
  if (!store && session.user.role === 'VENDOR') return <p className="text-[var(--text-3)]">No store.</p>;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: store ? { storeId: store.id } : {},
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);
  const { status: statusParam, search: searchParam, category: categoryParam } = await searchParams;
  let filtered = products;
  if (statusParam === 'active') filtered = filtered.filter((p) => p.isActive);
  if (statusParam === 'inactive') filtered = filtered.filter((p) => !p.isActive);
  if (searchParam?.trim()) {
    const q = searchParam.trim().toLowerCase();
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q));
  }
  if (categoryParam) filtered = filtered.filter((p) => p.category.slug === categoryParam || p.categoryId === categoryParam);

  function getFirstImage(images: unknown): string | null {
    if (Array.isArray(images) && images[0]) return images[0] as string;
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your store inventory"
        actions={
          <Link href="/vendor/products/new" className="btn btn-primary rounded-xl px-5 py-2.5 font-sans text-[14px] font-semibold bg-[var(--gold)] text-black hover:opacity-90">
            <Plus className="w-4 h-4" />
            Add product
          </Link>
        }
      />
      <div className="mt-8">
      <VendorProductFilters
        categories={categories}
        currentStatus={statusParam}
        currentSearch={searchParam ?? ''}
        currentCategory={categoryParam ?? ''}
      />
      <div className="flex gap-1.5 mb-6 mt-4">
          <Link
            href="/vendor/products"
            className={`font-sans text-[12px] font-medium py-1.5 px-3.5 rounded-full border cursor-pointer transition-all ${
              !statusParam ? 'bg-[var(--gold-bg)] border-[var(--line-gold)] text-[var(--gold)]' : 'border-[var(--line)] text-[var(--text-3)] hover:border-[var(--line-md)] hover:text-[var(--text-2)]'
            }`}
          >
            All
          </Link>
          <Link
            href="/vendor/products?status=active"
            className={`font-sans text-[12px] font-medium py-1.5 px-3.5 rounded-full border cursor-pointer transition-all ${
              statusParam === 'active' ? 'bg-[var(--gold-bg)] border-[var(--line-gold)] text-[var(--gold)]' : 'border-[var(--line)] text-[var(--text-3)] hover:border-[var(--line-md)] hover:text-[var(--text-2)]'
            }`}
          >
            Active
          </Link>
          <Link
            href="/vendor/products?status=inactive"
            className={`font-sans text-[12px] font-medium py-1.5 px-3.5 rounded-full border cursor-pointer transition-all ${
              statusParam === 'inactive' ? 'bg-[var(--gold-bg)] border-[var(--line-gold)] text-[var(--gold)]' : 'border-[var(--line)] text-[var(--text-3)] hover:border-[var(--line-md)] hover:text-[var(--text-2)]'
            }`}
          >
            Inactive
          </Link>
        </div>
      <div className="panel overflow-hidden">
      <DataTable empty={filtered.length === 0} emptyTitle="No products" emptySubtitle="Add your first product.">
        <table className="w-full border-collapse">
          <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}>Product</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}>Category</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}>Price</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}>Stock</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}>Status</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const img = getFirstImage(p.images);
              return (
                <tr
                  key={p.id}
                  className="border-b transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <td className="py-3.5 px-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--surface3)]">
                        {img ? <Image src={img} alt="" width={40} height={48} className="object-cover w-full h-full" /> : null}
                      </div>
                      <div>
                        <p className="font-sans text-[13px] font-medium" style={{ color: 'var(--text)' }}>{p.title}</p>
                        {p.sku && <p className="font-sans text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>{p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{p.category.name}</td>
                  <td className="py-3.5 px-4 font-sans text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{formatPrice(Number(p.price))}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className="font-sans text-[13px] font-semibold"
                      style={{
                        color: p.stock === 0 ? 'var(--red)' : p.stock <= 10 ? 'var(--amber)' : 'var(--text-3)',
                      }}
                    >
                      {p.stock === 0 ? 'Out' : p.stock}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={p.isActive ? 'badge badge-green' : 'badge badge-neutral'}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/vendor/products/${p.id}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border transition-colors hover:border-[var(--line-gold)]"
                        style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
                      >
                        <Pencil className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
                      </Link>
                      <Link
                        href={`/vendor/products/${p.id}?delete=1`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border transition-colors hover:bg-[var(--red-bg)] hover:border-[rgba(239,68,68,0.2)]"
                        style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
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
    </div>
  );
}
