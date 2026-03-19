import dynamic from 'next/dynamic';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCommissionPercent } from '@/lib/stripe';
import { formatPrice } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

const RevenueChart = dynamic(
  () => import('@/components/shared/RevenueChart').then((m) => ({ default: m.RevenueChart })),
  { ssr: false }
);

const AnalyticsOrdersChart = dynamic(
  () => import('@/components/admin/AnalyticsOrdersChart').then((m) => ({ default: m.AnalyticsOrdersChart })),
  { ssr: false }
);

const AnalyticsRevenueByStoreChart = dynamic(
  () => import('@/components/admin/AnalyticsRevenueByStoreChart').then((m) => ({ default: m.AnalyticsRevenueByStoreChart })),
  { ssr: false }
);

const AnalyticsOrderStatusChart = dynamic(
  () => import('@/components/admin/AnalyticsOrderStatusChart').then((m) => ({ default: m.AnalyticsOrderStatusChart })),
  { ssr: false }
);

const RANGE_DAYS: Record<string, number> = { '7D': 7, '30D': 30, '90D': 90, '1Y': 365 };

function getDateRange(rangeKey: string): { start: Date; end: Date } {
  const days = RANGE_DAYS[rangeKey] ?? 30;
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const rangeKey = rangeParam && RANGE_DAYS[rangeParam] ? rangeParam : '30D';
  const { start, end } = getDateRange(rangeKey);
  const commissionPercent = await getCommissionPercent();

  const orders = await prisma.order.findMany({
    where: {
      status: { not: 'CANCELLED' },
      createdAt: { gte: start, lte: end },
    },
    include: {
      store: { select: { id: true, name: true } },
      orderItems: { include: { product: { select: { id: true, title: true, slug: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const commissionEarned = totalRevenue * (commissionPercent / 100);
  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  const revenueByDate: Record<string, number> = {};
  const ordersByDate: Record<string, number> = {};
  const days = RANGE_DAYS[rangeKey] ?? 30;
  for (let i = 0; i <= days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    revenueByDate[key] = 0;
    ordersByDate[key] = 0;
  }
  orders.forEach((o) => {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    revenueByDate[key] = (revenueByDate[key] ?? 0) + Number(o.total);
    ordersByDate[key] = (ordersByDate[key] ?? 0) + 1;
  });

  const revenueChartData = Object.entries(revenueByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));

  const ordersChartData = Object.entries(ordersByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const revenueByStore: Record<string, { name: string; total: number }> = {};
  orders.forEach((o) => {
    const id = o.store.id;
    if (!revenueByStore[id]) revenueByStore[id] = { name: o.store.name, total: 0 };
    revenueByStore[id].total += Number(o.total);
  });
  const storeRanking = Object.entries(revenueByStore)
    .map(([id, v]) => ({ storeId: id, storeName: v.name, total: v.total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const orderStatusBreakdown: Record<string, number> = {};
  orders.forEach((o) => {
    orderStatusBreakdown[o.status] = (orderStatusBreakdown[o.status] ?? 0) + 1;
  });
  const orderStatusChartData = Object.entries(orderStatusBreakdown).map(([name, value]) => ({ name, value }));

  const productSales: Record<string, { title: string; slug: string; quantity: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.orderItems.forEach((item) => {
      const id = item.product.id;
      if (!productSales[id]) {
        productSales[id] = {
          title: item.product.title,
          slug: item.product.slug,
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[id].quantity += item.quantity;
      productSales[id].revenue += Number(item.price) * item.quantity;
    });
  });
  const topProducts = Object.entries(productSales)
    .map(([id, v]) => ({ productId: id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Advanced analytics"
        subtitle={`Insights for the selected period (${rangeKey})`}
        actions={
          <div className="flex gap-1.5">
            {(['7D', '30D', '90D', '1Y'] as const).map((r) => (
              <Link
                key={r}
                href={`/admin/analytics?range=${r}`}
                className="font-sans text-[11px] font-medium py-1.5 px-3 rounded-full border no-underline transition-all duration-150"
                style={{
                  borderColor: r === rangeKey ? 'var(--line-gold)' : 'var(--line)',
                  background: r === rangeKey ? 'var(--gold-bg)' : 'transparent',
                  color: r === rangeKey ? 'var(--gold)' : 'var(--text-3)',
                }}
              >
                {r}
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total revenue" value={formatPrice(totalRevenue)} icon={DollarSign} color="gold" />
        <StatsCard label="Commission earned" value={formatPrice(commissionEarned)} icon={TrendingUp} color="green" />
        <StatsCard label="Orders" value={String(orderCount)} icon={ShoppingBag} color="blue" />
        <StatsCard label="Avg order value" value={formatPrice(avgOrderValue)} icon={ShoppingBag} color="blue" />
      </div>

      <div className="grid gap-6 mb-8 lg:grid-cols-2">
        <div className="panel p-6">
          <RevenueChart title="Revenue over time" data={revenueChartData} height={260} />
        </div>
        <div className="panel p-6">
          <AnalyticsOrdersChart data={ordersChartData} height={260} />
        </div>
        <div className="panel p-6">
          <AnalyticsRevenueByStoreChart
            data={storeRanking.map((r) => ({ storeName: r.storeName, total: r.total }))}
            height={260}
          />
        </div>
        <div className="panel p-6">
          <AnalyticsOrderStatusChart data={orderStatusChartData} height={260} />
        </div>
      </div>

      <div className="grid gap-8 mb-8 lg:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: 'var(--line)' }}>
            <h3 className="font-display text-[18px] font-normal" style={{ color: 'var(--text)' }}>
              Revenue by store
            </h3>
            <p className="font-sans text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              Top stores by revenue in period
            </p>
          </div>
          <div className="overflow-x-auto">
            {storeRanking.length === 0 ? (
              <p className="font-sans text-[13px] p-6" style={{ color: 'var(--text-4)' }}>No orders in this period</p>
            ) : (
              <table className="w-full border-collapse">
                <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
                  <tr>
                    <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Store</th>
                    <th className="py-3 px-4 text-right font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {storeRanking.map((row) => (
                    <tr key={row.storeId} className="border-b" style={{ borderColor: 'var(--line)' }}>
                      <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{row.storeName}</td>
                      <td className="py-3.5 px-4 font-sans text-[13px] font-semibold text-right" style={{ color: 'var(--gold)' }}>{formatPrice(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: 'var(--line)' }}>
            <h3 className="font-display text-[18px] font-normal" style={{ color: 'var(--text)' }}>
              Top products
            </h3>
            <p className="font-sans text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              By revenue in period
            </p>
          </div>
          <div className="overflow-x-auto">
            {topProducts.length === 0 ? (
              <p className="font-sans text-[13px] p-6" style={{ color: 'var(--text-4)' }}>No orders in this period</p>
            ) : (
              <table className="w-full border-collapse">
                <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
                  <tr>
                    <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Product</th>
                    <th className="py-3 px-4 text-right font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Qty</th>
                    <th className="py-3 px-4 text-right font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((row) => (
                    <tr key={row.productId} className="border-b" style={{ borderColor: 'var(--line)' }}>
                      <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>
                        <Link href={`/admin/products/${row.productId}`} className="hover:underline" style={{ color: 'var(--gold)' }}>
                          {row.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-[13px] text-right" style={{ color: 'var(--text-3)' }}>{row.quantity}</td>
                      <td className="py-3.5 px-4 font-sans text-[13px] font-semibold text-right" style={{ color: 'var(--gold)' }}>{formatPrice(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
