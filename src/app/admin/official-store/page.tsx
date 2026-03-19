import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pencil } from 'lucide-react';

function getFirstImage(images: unknown): string | null {
  if (Array.isArray(images) && images[0]) return images[0] as string;
  return null;
}

export default async function AdminOfficialStorePage() {
  const store = await prisma.store.findFirst({
    where: { isOfficial: true },
  });
  if (!store) return <p className="text-[var(--text-3)]">Official store not found.</p>;
  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader title="InsyncX Official Store" subtitle={`${products.length} products`} />
      <DataTable empty={products.length === 0} emptyTitle="No products in official store">
        <table className="w-full border-collapse">
          <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Product</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Category</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Price</th>
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
                  <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{p.category.name}</td>
                  <td className="py-3.5 px-4 font-sans text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{formatPrice(Number(p.price))}</td>
                  <td className="py-3.5 px-4">
                    <Link href={`/admin/products/${p.id}`} className="btn btn-ghost btn-sm">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
