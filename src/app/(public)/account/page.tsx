import { auth } from '@/lib/auth';
import { getOrdersForUser } from '@/actions/order.actions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatCard } from '@/components/account/StatCard';
import { ShoppingBag, Heart, DollarSign, ArrowRight } from 'lucide-react';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [orders, wishlistCount] = await Promise.all([
    getOrdersForUser(session.user.id),
    prisma.wishlist.count({ where: { userId: session.user.id } }),
  ]);
  const totalSpent = orders.reduce((s, o) => s + Number(o.total), 0);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="py-10 px-12 md:px-12" style={{ padding: '40px 48px' }}>
      <header className="mb-10">
        <p className="font-sans text-[14px]" style={{ color: 'var(--text-3)' }}>
          Welcome back,
        </p>
        <h1
          className="font-display text-[48px] font-light animate-fade-up"
          style={{ color: 'var(--text)' }}
        >
          {session.user.name ?? 'Customer'}
        </h1>
        <p className="font-sans text-[14px] mt-2" style={{ color: 'var(--text-3)' }}>
          Here&apos;s what&apos;s happening with your account
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          sub="All time"
        />
        <StatCard
          label="Wishlist Items"
          value={wishlistCount}
          icon={Heart}
          sub="Saved products"
        />
        <StatCard
          label="Total Spent"
          value={formatPrice(totalSpent)}
          icon={DollarSign}
          sub="Lifetime value"
        />
      </div>

      <div className="card mb-8">
        <div className="flex items-center justify-between px-6 pt-6 pb-0" style={{ padding: '24px 24px 0' }}>
          <h2 className="font-display text-[24px] font-normal" style={{ color: 'var(--text)' }}>
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium transition-colors hover:underline"
            style={{ color: 'var(--gold)' }}
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="mt-5" style={{ marginTop: 20 }}>
          {recentOrders.length === 0 ? (
            <p
              className="font-sans text-[14px] text-center py-8 px-6"
              style={{ color: 'var(--text-3)' }}
            >
              No orders yet.
            </p>
          ) : (
            <>
              <div
                className="grid gap-4 px-6 pb-3 border-b"
                style={{
                  gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
                  padding: '0 24px 12px',
                  borderBottomColor: 'var(--line)',
                }}
              >
                <span
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text-4)' }}
                >
                  Order
                </span>
                <span
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text-4)' }}
                >
                  Date
                </span>
                <span
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text-4)' }}
                >
                  Items
                </span>
                <span
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text-4)' }}
                >
                  Total
                </span>
                <span
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text-4)' }}
                >
                  Status
                </span>
              </div>
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="grid gap-4 items-center px-6 py-4 border-b transition-colors hover:bg-[var(--surface2)]"
                  style={{
                    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
                    borderBottomColor: 'var(--line)',
                  }}
                >
                  <span
                    className="font-sans text-[13px] font-medium font-[tabular-nums]"
                    style={{ color: 'var(--gold)' }}
                  >
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>
                    —
                  </span>
                  <span className="font-sans text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
                    {formatPrice(Number(order.total))}
                  </span>
                  <StatusBadge status={order.status} />
                </Link>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/account/orders"
          className="card card-hover card-p flex items-center gap-4 no-underline"
        >
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center border shrink-0"
            style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
          >
            <ShoppingBag className="w-[18px] h-[18px]" style={{ color: 'var(--text-3)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[14px] font-medium" style={{ color: 'var(--text)' }}>
              My Orders
            </p>
            <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              Track your purchases
            </p>
          </div>
          <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-4)' }} />
        </Link>
        <Link
          href="/account/wishlist"
          className="card card-hover card-p flex items-center gap-4 no-underline"
        >
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center border shrink-0"
            style={{ background: 'var(--surface2)', borderColor: 'var(--line)' }}
          >
            <Heart className="w-[18px] h-[18px]" style={{ color: 'var(--text-3)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[14px] font-medium" style={{ color: 'var(--text)' }}>
              Wishlist
            </p>
            <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              Your saved items
            </p>
          </div>
          <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-4)' }} />
        </Link>
      </div>
    </div>
  );
}
