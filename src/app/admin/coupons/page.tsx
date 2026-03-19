import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ListSearchFilter } from '@/components/shared/ListSearchFilter';
import { DeleteCouponButton } from '@/components/admin/DeleteCouponButton';
import { Plus, Pencil } from 'lucide-react';

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = '' } = await searchParams;
  const couponsRaw = await prisma.coupon.findMany({
    include: { store: { select: { name: true } } },
    orderBy: { code: 'asc' },
  });

  const coupons = search.trim()
    ? couponsRaw.filter((c) => {
        const q = search.trim().toLowerCase();
        return c.code.toLowerCase().includes(q) || (c.store?.name?.toLowerCase().includes(q) ?? false);
      })
    : couponsRaw;

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle="Platform and store coupons"
        actions={
          <Link
            href="/admin/coupons/new"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-sans text-[14px] font-semibold bg-[var(--gold)] text-black hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Create coupon
          </Link>
        }
      />
      <ListSearchFilter basePath="/admin/coupons" placeholder="Search by code or store…" currentSearch={search} />
      <div className="panel overflow-hidden mt-8">
        <DataTable empty={coupons.length === 0} emptyTitle="No coupons" emptySubtitle="Create a platform or store coupon.">
          <table className="w-full border-collapse">
            <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
              <tr>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Code</th>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Store</th>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Type</th>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Discount</th>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Usage</th>
                <th className="py-3 px-4 text-right font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                  <td className="py-3.5 px-4 font-sans text-[13px] font-semibold font-mono" style={{ color: 'var(--gold)' }}>{c.code}</td>
                  <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{c.store?.name ?? 'Platform'}</td>
                  <td className="py-3.5 px-4"><span className="badge badge-neutral">{c.type}</span></td>
                  <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{Number(c.discount)}{c.type === 'PERCENT' ? '%' : ''}</td>
                  <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>{c.usedCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/coupons/${c.id}`}
                        className="p-1.5 rounded border border-transparent hover:border-[var(--line-gold)] cursor-pointer transition-colors"
                        style={{ color: 'var(--text-4)' }}
                        title="Edit"
                        aria-label={`Edit coupon ${c.code}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteCouponButton couponId={c.id} code={c.code} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      </div>
    </div>
  );
}
