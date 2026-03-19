import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    include: { store: { select: { name: true } } },
    orderBy: { code: 'asc' },
  });

  return (
    <div>
      <PageHeader title="Coupons" subtitle={`${coupons.length} coupons`} />
      <DataTable empty={coupons.length === 0} emptyTitle="No coupons">
        <table className="w-full border-collapse">
          <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Code</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Store</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Type</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Discount</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Usage</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                <td className="py-3.5 px-4 font-sans text-[13px] font-semibold font-mono" style={{ color: 'var(--gold)' }}>{c.code}</td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{c.store?.name ?? 'Platform'}</td>
                <td className="py-3.5 px-4"><span className="badge badge-neutral">{c.type}</span></td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{c.discount}{c.type === 'PERCENT' ? '%' : ''}</td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>{c.usedCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
