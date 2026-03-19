import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { Wallet, DollarSign, TrendingUp } from 'lucide-react';

export default async function AdminPayoutsPage() {
  const payouts = await prisma.payout.findMany({
    include: { store: { select: { name: true, logo: true } } },
    orderBy: { requestedAt: 'desc' },
  });
  const pendingSum = payouts.filter((p) => p.status === 'PENDING').reduce((s, p) => s + Number(p.amount), 0);
  const totalPaid = payouts.filter((p) => p.status === 'PAID').reduce((s, p) => s + Number(p.amount), 0);
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthPaid = payouts
    .filter((p) => p.status === 'PAID' && p.processedAt && new Date(p.processedAt).getMonth() === thisMonth && new Date(p.processedAt).getFullYear() === thisYear)
    .reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div>
      <PageHeader title="Payout Requests" subtitle="Review and process vendor payouts" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard label="Pending Payouts" value={formatPrice(pendingSum)} icon={Wallet} color="red" />
        <StatsCard label="Total Paid Out" value={formatPrice(totalPaid)} icon={DollarSign} color="green" />
        <StatsCard label="This Month" value={formatPrice(thisMonthPaid)} icon={TrendingUp} color="gold" />
      </div>
      <DataTable header={{ title: 'Payouts' }} empty={payouts.length === 0} emptyTitle="No payout requests">
        <table className="w-full border-collapse">
          <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Store</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Amount</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Requested</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Status</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text)' }}>{p.store.name}</td>
                <td className="py-3.5 px-4 font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{formatPrice(Number(p.amount))}</td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>{new Date(p.requestedAt).toLocaleDateString()}</td>
                <td className="py-3.5 px-4">
                  <span className={`badge ${p.status === 'PAID' ? 'badge-green' : p.status === 'PENDING' ? 'badge-amber' : p.status === 'APPROVED' ? 'badge-blue' : 'badge-red'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-4">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
