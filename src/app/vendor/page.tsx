import dynamic from 'next/dynamic';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { getCommissionPercent } from '@/lib/stripe';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/ui/status-badge';

const RevenueChart = dynamic(
  () => import('@/components/shared/RevenueChart').then((m) => ({ default: m.RevenueChart })),
  { ssr: false }
);
import { DollarSign, ShoppingBag, Package, AlertTriangle, Plus, ArrowRight, Tag } from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const storeId = (session.user as { storeId?: string }).storeId;
  const store = storeId
    ? await prisma.store.findUnique({ where: { id: storeId } })
    : await prisma.store.findFirst({ where: { ownerId: session.user.id } });
  if (!store && session.user.role === 'VENDOR') {
    return (
      <div>
        <p className="font-sans text-[14px]" style={{ color: 'var(--amber)' }}>No store linked. Contact support.</p>
      </div>
    );
  }
  const commission = await getCommissionPercent();
  const where = store ? { storeId: store.id } : {};
  const [
    ordersCount,
    productsCount,
    lowStockCount,
    revenueRows,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.order.count({ where: { ...where, status: { not: 'CANCELLED' } } }),
    prisma.product.count({ where: store ? { storeId: store.id } : {} }),
    prisma.product.count({ where: store ? { storeId: store.id, stock: { lte: 5, gt: 0 } } : {} }),
    prisma.order.findMany({
      where: { ...where, status: { not: 'CANCELLED' } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.order.findMany({
      where: { ...where, status: { not: 'CANCELLED' } },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    store
      ? prisma.product.findMany({
          where: { storeId: store.id, stock: { lte: 5, gt: 0 } },
          take: 5,
        })
      : [],
  ]);
  const totalRevenue = revenueRows.reduce((s, o) => s + Number(o.total), 0);
  const netRevenue = totalRevenue * (1 - commission / 100);

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

  const greeting = getGreeting();
  const name = session.user.name ?? 'there';

  return (
    <div>
      {!store?.isApproved && store && (
        <div
          className="panel mb-8 p-4 font-sans text-[13px]"
          style={{
            background: 'var(--amber-bg)',
            borderColor: 'rgba(245,158,11,0.2)',
            color: 'var(--amber)',
          }}
        >
          Your store is pending admin approval.
        </div>
      )}
      <PageHeader
        title={store ? store.name : 'Vendor'}
        subtitle={`Good ${greeting}, ${name}`}
        actions={
          store?.slug ? (
            <Link href={`/store/${store.slug}`} className="inline-flex items-center gap-1.5 btn btn-ghost btn-sm">
              View Store <ArrowRight className="w-4 h-4" />
            </Link>
          ) : null
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-8">
        <StatsCard label="Revenue" value={formatPrice(netRevenue)} icon={DollarSign} color="gold" />
        <StatsCard label="Orders" value={ordersCount} icon={ShoppingBag} color="blue" />
        <StatsCard label="Products" value={productsCount} icon={Package} color="green" />
        <StatsCard label="Low Stock Alerts" value={lowStockCount} icon={AlertTriangle} color="red" />
      </div>
      <div className="grid gap-8 mb-8 lg:grid-cols-[1fr_400px]">
        <div className="panel p-6">
          <RevenueChart title="Revenue" data={chartData} />
        </div>
        <div className="panel overflow-hidden">
          <div
            className="flex items-center justify-between py-5 px-6 border-b"
            style={{ borderColor: 'var(--line)' }}
          >
            <h2 className="font-display text-[20px] font-normal" style={{ color: 'var(--text)' }}>
              Recent orders
            </h2>
            <Link href="/vendor/orders" className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium" style={{ color: 'var(--gold)' }}>
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="font-sans text-[13px] text-center py-8 px-6" style={{ color: 'var(--text-3)' }}>
              No orders yet
            </p>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-3.5 px-6 border-b"
                style={{ borderColor: 'var(--line)' }}
              >
                <div>
                  <p className="font-sans text-[13px] font-semibold" style={{ color: 'var(--gold)' }}>
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                    {order.user?.name ?? '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-sans text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
                    {formatPrice(Number(order.total))}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="panel overflow-hidden">
          <div
            className="flex items-center justify-between py-5 px-6 border-b"
            style={{ borderColor: 'var(--line)' }}
          >
            <h2 className="font-display text-[20px] font-normal" style={{ color: 'var(--text)' }}>
              Low stock
            </h2>
            {lowStockCount > 0 && (
              <span className="badge badge-red">{lowStockCount}</span>
            )}
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="font-sans text-[13px] text-center py-8 px-6" style={{ color: 'var(--text-3)' }}>
              All good
            </p>
          ) : (
            lowStockProducts.map((p) => {
              const imgs = Array.isArray(p.images) ? (p.images as string[]) : [];
              const img = imgs[0];
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-3.5 px-6 border-b"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-10 rounded-md overflow-hidden shrink-0 bg-[var(--surface3)]"
                    >
                      {img ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-sans text-[13px]" style={{ color: 'var(--text)' }}>{p.title}</p>
                      <p className="font-sans text-[11px]" style={{ color: 'var(--red)' }}>Only {p.stock} left</p>
                    </div>
                  </div>
                  <Link
                    href={`/vendor/products/${p.id}`}
                    className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium"
                    style={{ color: 'var(--gold)' }}
                  >
                    Edit <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
        <div className="panel p-6">
          <h2 className="font-display text-[20px] font-normal mb-1" style={{ color: 'var(--text)' }}>
            Quick actions
          </h2>
          <p className="font-sans text-[13px] mb-5" style={{ color: 'var(--text-3)' }}>
            Shortcuts for common tasks
          </p>
          <Link
            href="/vendor/products/new"
            className="flex items-center gap-3.5 py-3 px-3 rounded-[10px] border mb-2.5 no-underline transition-colors hover:bg-[var(--surface2)]"
            style={{ borderColor: 'var(--line)' }}
          >
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: 'var(--surface2)' }}>
              <Plus className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[14px] font-medium" style={{ color: 'var(--text)' }}>Add Product</p>
              <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>Upload a new item</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-4)' }} />
          </Link>
          <Link
            href="/vendor/products"
            className="flex items-center gap-3.5 py-3 px-3 rounded-[10px] border mb-2.5 no-underline transition-colors hover:bg-[var(--surface2)]"
            style={{ borderColor: 'var(--line)' }}
          >
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: 'var(--surface2)' }}>
              <Package className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[14px] font-medium" style={{ color: 'var(--text)' }}>Manage Inventory</p>
              <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>Update stock levels</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-4)' }} />
          </Link>
          <Link
            href="/vendor/coupons"
            className="flex items-center gap-3.5 py-3 px-3 rounded-[10px] border no-underline transition-colors hover:bg-[var(--surface2)]"
            style={{ borderColor: 'var(--line)' }}
          >
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: 'var(--surface2)' }}>
              <Tag className="w-4 h-4" style={{ color: 'var(--text-3)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[14px] font-medium" style={{ color: 'var(--text)' }}>Create Coupon</p>
              <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>Set up a discount</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-4)' }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
