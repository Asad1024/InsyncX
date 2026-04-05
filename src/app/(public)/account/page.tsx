import { auth } from '@/lib/auth';
import { getOrdersForUser } from '@/actions/order.actions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { StatCard } from '@/components/account/StatCard';
import { OrderCard } from '@/components/account/OrderCard';
import { ShoppingBag, Heart, ArrowRight } from 'lucide-react';

function lastSixMonthsSpending(orders: Array<{ createdAt: Date; total: unknown }>): number[] {
  const out: number[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    let sum = 0;
    for (const o of orders) {
      const od = new Date(o.createdAt);
      if (od.getFullYear() === y && od.getMonth() === m) sum += Number(o.total);
    }
    out.push(sum);
  }
  return out;
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [orders, wishlistCount] = await Promise.all([
    getOrdersForUser(session.user.id),
    prisma.wishlist.count({ where: { userId: session.user.id } }),
  ]);
  const totalSpent = orders.reduce((s, o) => s + Number(o.total), 0);
  const recentOrders = orders.slice(0, 5);
  const spendingTrend = lastSixMonthsSpending(orders);

  return (
    <div className="px-4 py-8 md:px-8 lg:px-10 xl:px-12">
      <header className="account-welcome-enter mb-8 md:mb-10">
        <p className="mb-1 font-sans text-[14px] font-normal text-[var(--muted)]">Welcome back,</p>
        <h1 className="account-name-gradient">{session.user.name ?? 'Customer'}</h1>
        <p className="mt-2 font-sans text-[14px] text-[var(--muted)]">
          Here&apos;s what&apos;s happening with your account
        </p>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-12 lg:grid-cols-4 lg:grid-rows-2 lg:gap-5">
        <div
          className="account-stat-enter h-full min-h-[140px] lg:col-start-1 lg:row-start-1"
          style={{ animationDelay: '0.2s' }}
        >
          <StatCard label="Total Orders" value={orders.length} icon="orders" sub="All time" className="h-full" />
        </div>
        <div
          className="account-stat-enter h-full min-h-[140px] sm:col-start-2 lg:col-start-1 lg:row-start-2"
          style={{ animationDelay: '0.28s' }}
        >
          <StatCard
            label="Wishlist Items"
            value={wishlistCount}
            icon="wishlist"
            sub="Saved products"
            className="h-full"
          />
        </div>
        <div
          className="account-stat-enter h-full min-h-[200px] sm:col-span-2 sm:row-start-2 lg:col-span-3 lg:col-start-2 lg:row-span-2 lg:row-start-1"
          style={{ animationDelay: '0.36s' }}
        >
          <StatCard
            label="Total Spent"
            value={formatPrice(totalSpent)}
            icon="spent"
            sub="Lifetime value"
            featured
            sparklineValues={spendingTrend}
            className="h-full"
          />
        </div>
      </div>

      <div className="account-orders-enter mb-8 rounded-2xl border border-white/10 bg-[rgba(4,14,32,0.35)] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-[16px] md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 md:mb-5 md:pb-5">
          <h2 className="font-display text-[18px] font-bold text-[var(--white)] md:text-[20px]">
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="group inline-flex items-center gap-1 font-sans text-[12px] font-medium text-[var(--cyan)] transition-colors duration-200 hover:underline"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="py-10 text-center font-sans text-[14px] text-[var(--muted)]">No orders yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} variant="compact" />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="account-quick-card-enter group flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(4,14,32,0.42)] px-6 py-5 no-underline shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-[16px] transition-[transform,box-shadow,border-color] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[rgba(29,110,255,0.35)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.4),0_0_32px_rgba(29,110,255,0.12)] md:px-7 md:py-6"
          style={{ animationDelay: '0.6s', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[rgba(29,110,255,0.1)]">
              <ShoppingBag className="h-5 w-5 text-[var(--cyan)]" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-[15px] font-semibold text-[var(--white)]">My Orders</p>
              <p className="mt-0.5 font-sans text-[12px] text-[var(--muted)]">Track your purchases</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-[var(--muted)] transition-all duration-200 group-hover:translate-x-1.5 group-hover:text-[var(--cyan)]" />
        </Link>
        <Link
          href="/account/wishlist"
          className="account-quick-card-enter group flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(4,14,32,0.42)] px-6 py-5 no-underline shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-[16px] transition-[transform,box-shadow,border-color] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[rgba(29,110,255,0.35)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.4),0_0_32px_rgba(29,110,255,0.12)] md:px-7 md:py-6"
          style={{ animationDelay: '0.65s', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[rgba(29,110,255,0.1)]">
              <Heart className="h-5 w-5 text-[var(--cyan)]" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-[15px] font-semibold text-[var(--white)]">Wishlist</p>
              <p className="mt-0.5 font-sans text-[12px] text-[var(--muted)]">Your saved items</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-[var(--muted)] transition-all duration-200 group-hover:translate-x-1.5 group-hover:text-[var(--cyan)]" />
        </Link>
      </div>
    </div>
  );
}
