import dynamic from 'next/dynamic';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { getCommissionPercent } from '@/lib/stripe';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';

const RevenueChart = dynamic(
  () => import('@/components/shared/RevenueChart').then((m) => ({ default: m.RevenueChart })),
  { ssr: false }
);
import { StatusBadge } from '@/components/ui/status-badge';
import { DollarSign, TrendingUp, ShoppingBag, Users, Store, AlertCircle, Package, ArrowRight } from 'lucide-react';

export default async function AdminDashboardPage() {
  const commission = await getCommissionPercent();
  const [
    ordersCount,
    usersCount,
    storesCount,
    productsCount,
    pendingStoresCount,
    revenueRows,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.user.count(),
    prisma.store.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.store.count({ where: { isApproved: false } }),
    prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: {
        user: { select: { name: true, email: true } },
        store: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { status: { not: 'CANCELLED' } },
    }),
  ]);
  const totalRevenue = revenueRows.reduce((s, o) => s + Number(o.total), 0);
  const platformCommission = totalRevenue * (commission / 100);

  const chartData = (() => {
    const byDate: Record<string, number> = {};
    revenueRows.forEach((o) => {
      const d = new Date(o.createdAt).toISOString().slice(0, 10);
      byDate[d] = (byDate[d] ?? 0) + Number(o.total);
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, value]) => ({ date, value }));
  })();

  return (
    <div>
      <PageHeader title="Platform overview" subtitle="InsyncX admin dashboard" />
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard label="Platform Revenue" value={formatPrice(totalRevenue)} icon={DollarSign} color="gold" />
        <StatsCard label="Commission Earned" value={formatPrice(platformCommission)} icon={TrendingUp} color="green" />
        <StatsCard label="Total Orders" value={String(ordersCount)} icon={ShoppingBag} color="blue" />
        <StatsCard label="Total Users" value={String(usersCount)} icon={Users} color="blue" />
        <StatsCard label="Active Stores" value={String(storesCount)} icon={Store} color="red" />
        <StatsCard label="Active Products" value={String(productsCount)} icon={Package} color="blue" />
      </div>
      {ordersByStatus.length > 0 && (
        <div className="panel mb-8 p-6">
          <h3 className="font-display text-[18px] font-normal mb-1" style={{ color: 'var(--text)' }}>Orders by status</h3>
          <p className="font-sans text-[13px] mb-4" style={{ color: 'var(--text-3)' }}>Current order counts per status</p>
          <div className="flex flex-wrap gap-4">
            {ordersByStatus.map(({ status, _count }) => (
              <span key={status} className="font-sans text-[14px]" style={{ color: 'var(--text-2)' }}>
                <span className="font-medium" style={{ color: 'var(--text)' }}>{status}</span>
                <span className="ml-1.5">({_count.id})</span>
              </span>
            ))}
          </div>
        </div>
      )}
      {pendingStoresCount > 0 && (
        <Link
          href="/admin/vendors?filter=pending"
          className="panel flex items-center gap-3 mb-8 py-4 px-6 no-underline transition-opacity hover:opacity-90"
          style={{
            background: 'var(--amber-bg)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <AlertCircle className="w-5 h-5 shrink-0" style={{ color: 'var(--amber)' }} />
          <span className="font-sans text-[14px] font-medium" style={{ color: 'var(--amber)' }}>
            {pendingStoresCount} vendor store{pendingStoresCount !== 1 ? 's' : ''} pending approval
          </span>
          <span className="inline-flex items-center gap-1.5 font-sans text-[13px] ml-auto" style={{ color: 'var(--gold)' }}>Review Now <ArrowRight className="w-4 h-4" /></span>
        </Link>
      )}
      <div className="grid gap-8 mb-8 lg:grid-cols-[1fr_400px]">
        <div className="panel p-6">
          <RevenueChart title="Platform revenue" data={chartData} />
        </div>
        <div className="panel overflow-hidden">
        <DataTable header={{ title: 'Recent orders' }} empty={recentOrders.length === 0} emptyTitle="No orders">
          <table className="w-full border-collapse">
            <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
              <tr>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Order</th>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Customer</th>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Store</th>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Total</th>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                  <td className="py-3.5 px-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-sans text-[13px] font-semibold no-underline hover:underline" style={{ color: 'var(--gold)' }}>
                      #{order.id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-sans text-[13px] block" style={{ color: 'var(--text-2)' }}>{order.user.name ?? '—'}</span>
                    {order.user.email && <span className="font-sans text-[11px] block" style={{ color: 'var(--text-4)' }}>{order.user.email}</span>}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{order.store.name}</td>
                  <td className="py-3.5 px-4 font-sans text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{formatPrice(Number(order.total))}</td>
                  <td className="py-3.5 px-4"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
        </div>
      </div>
    </div>
  );
}
