import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { ListSearchFilter } from '@/components/shared/ListSearchFilter';
import { PayoutRequest } from '@/components/vendor/PayoutRequest';
import { Wallet, DollarSign, Clock } from 'lucide-react';

const PAYOUT_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
];

export default async function VendorPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!store) return <p className="text-[var(--text-3)]">No store.</p>;
  const { status } = await searchParams;
  const payoutsRaw = await prisma.payout.findMany({
    where: { storeId: store.id },
    orderBy: { requestedAt: 'desc' },
  });
  const payouts = status && PAYOUT_STATUSES.some((s) => s.value === status)
    ? payoutsRaw.filter((p) => p.status === status)
    : payoutsRaw;
  const totalPaid = payoutsRaw.filter((p) => p.status === 'PAID').reduce((s, p) => s + Number(p.amount), 0);
  const pendingSum = payoutsRaw.filter((p) => p.status === 'PENDING').reduce((s, p) => s + Number(p.amount), 0);
  const available = 0;

  return (
    <div>
      <PageHeader title="Payouts" subtitle="Your earnings and payment history" />
      <ListSearchFilter
        basePath="/vendor/payouts"
        filters={[{ param: 'status', label: 'All statuses', options: PAYOUT_STATUSES }]}
        currentFilters={status ? { status } : {}}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-8">
        <StatsCard label="Available Balance" value={formatPrice(available)} icon={Wallet} color="gold" />
        <StatsCard label="Total Earned" value={formatPrice(totalPaid)} icon={DollarSign} color="green" />
        <StatsCard label="Pending" value={formatPrice(pendingSum)} icon={Clock} color="red" />
      </div>
      <div className="panel p-6 mb-8">
        <PayoutRequest storeId={store.id} stripeConnectId={store.stripeConnectId} />
      </div>
      <div className="panel overflow-hidden">
      <DataTable header={{ title: 'Payout history' }} empty={payouts.length === 0} emptyTitle="No payouts yet">
        <table className="w-full border-collapse">
          <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Date</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Amount</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Status</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Transfer ID</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{new Date(p.requestedAt).toLocaleDateString()}</td>
                <td className="py-3.5 px-4 font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{formatPrice(Number(p.amount))}</td>
                <td className="py-3.5 px-4">
                  <span className={`badge ${p.status === 'PAID' ? 'badge-green' : p.status === 'PENDING' ? 'badge-amber' : 'badge-red'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-sans text-[11px] font-mono" style={{ color: 'var(--text-4)' }}>{p.stripeTransferId ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
      </div>
    </div>
  );
}
