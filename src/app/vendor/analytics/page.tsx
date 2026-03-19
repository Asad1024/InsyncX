import dynamic from 'next/dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCommissionPercent } from '@/lib/stripe';
import { formatPrice } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';

const VendorAnalyticsCharts = dynamic(
  () => import('@/components/vendor/VendorAnalyticsCharts').then((m) => ({ default: m.VendorAnalyticsCharts })),
  { ssr: false }
);

export default async function VendorAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!store) return <p className="text-[var(--text-3)]">No store.</p>;
  const commission = getCommissionPercent();
  const orders = await prisma.order.findMany({
    where: { storeId: store.id, status: { not: 'CANCELLED' } },
    select: { total: true, createdAt: true, status: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const net = revenue * (1 - commission / 100);
  const avgOrder = orders.length ? revenue / orders.length : 0;
  const productCount = await prisma.product.count({ where: { storeId: store.id } });

  const chartData = (() => {
    const byDate: Record<string, number> = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt).toISOString().slice(0, 10);
      byDate[d] = (byDate[d] ?? 0) + Number(o.total);
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, value]) => ({ date, value }));
  })();

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = [
    { name: 'Pending', value: statusCounts.PENDING ?? 0, color: 'var(--amber)' },
    { name: 'Confirmed', value: statusCounts.CONFIRMED ?? 0, color: 'var(--blue)' },
    { name: 'Shipped', value: statusCounts.SHIPPED ?? 0, color: 'var(--gold)' },
    { name: 'Delivered', value: statusCounts.DELIVERED ?? 0, color: 'var(--green)' },
    { name: 'Cancelled', value: statusCounts.CANCELLED ?? 0, color: 'var(--red)' },
  ].filter((d) => d.value > 0);

  const orderItems = await prisma.orderItem.findMany({
    where: { order: { storeId: store.id } },
    include: { product: { select: { title: true, images: true } } },
  });
  const productSales: Record<string, { title: string; sold: number; revenue: number; img: string | null }> = {};
  orderItems.forEach((oi) => {
    const id = oi.productId;
    if (!productSales[id]) {
      const imgs = Array.isArray(oi.product.images) ? (oi.product.images as string[]) : [];
      productSales[id] = { title: oi.product.title, sold: 0, revenue: 0, img: imgs[0] ?? null };
    }
    productSales[id].sold += oi.quantity;
    productSales[id].revenue += Number(oi.price) * oi.quantity;
  });
  const topProducts = Object.entries(productSales)
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Your store performance" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Revenue" value={formatPrice(net)} icon={DollarSign} color="gold" />
        <StatsCard label="Orders" value={orders.length} icon={ShoppingBag} color="blue" />
        <StatsCard label="Avg Order Value" value={formatPrice(avgOrder)} icon={TrendingUp} color="green" />
        <StatsCard label="Total Products" value={productCount} icon={Package} color="red" />
      </div>
      <VendorAnalyticsCharts chartData={chartData} pieData={pieData} />
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <DataTable header={{ title: 'Top Products' }} empty={topProducts.length === 0} emptyTitle="No sales yet">
          <table className="w-full border-collapse">
            <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
              <tr>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>#</th>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Product</th>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Sold</th>
                <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                  <td className="py-3.5 px-4 font-sans text-[13px] font-bold" style={{ color: 'var(--text-4)' }}>{i + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 bg-[var(--surface3)]">
                        {p.img ? <img src={p.img} alt="" className="w-full h-full object-cover" /> : null}
                      </div>
                      <span className="font-sans text-[13px]" style={{ color: 'var(--text)' }}>{p.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>{p.sold}</td>
                  <td className="py-3.5 px-4 font-sans text-[13px] font-semibold" style={{ color: 'var(--gold)' }}>{formatPrice(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      </div>
    </div>
  );
}
