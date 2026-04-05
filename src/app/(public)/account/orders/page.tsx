import { auth } from '@/lib/auth';
import { getOrdersForUser } from '@/actions/order.actions';
import Link from 'next/link';
import type { OrderStatus } from '@prisma/client';
import { OrderCard } from '@/components/account/OrderCard';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS: { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RETURN_REQUESTED', label: 'Return Requested' },
  { value: 'RETURN_APPROVED', label: 'Return Approved' },
  { value: 'RETURN_REJECTED', label: 'Return Rejected' },
  { value: 'RETURNED', label: 'Returned' },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const orders = await getOrdersForUser(session.user.id);
  const { status: statusParam } = await searchParams;
  const statusFilter = (statusParam as OrderStatus) ?? '';
  const filtered =
    statusFilter && TABS.some((t) => t.value === statusFilter)
      ? orders.filter((o) => o.status === statusFilter)
      : orders;

  return (
    <div className="px-4 py-8 md:px-8 lg:px-10 xl:px-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
        <h1 className="account-name-gradient text-[clamp(28px,5vw,44px)] leading-tight">My Orders</h1>
        <p className="font-sans text-[13px] text-[var(--muted)]">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:mb-8 md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {TABS.map(({ value, label }) => {
          const isActive = statusFilter === value;
          const href = value ? `/account/orders?status=${value}` : '/account/orders';
          return (
            <Link
              key={value || 'all'}
              href={href}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-2 font-sans text-[11px] font-medium transition-all duration-200 md:text-[12px]',
                isActive
                  ? 'border-transparent bg-gradient-to-br from-[var(--blue)] to-[var(--blue-mid)] text-white shadow-[0_0_20px_rgba(29,110,255,0.35)]'
                  : 'border-white/10 bg-[rgba(255,255,255,0.03)] text-[var(--muted)] hover:border-[rgba(29,110,255,0.35)] hover:text-[var(--white)]'
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="account-glass-panel text-center">
          <div className="px-6 py-16 md:py-20">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-[var(--muted)]" strokeWidth={1.25} />
            <h2 className="font-display text-[24px] font-bold text-[var(--white)] md:text-[28px]">
              No orders yet
            </h2>
            <p className="mt-2 font-sans text-[13px] text-[var(--muted)]">
              {orders.length === 0
                ? 'Start shopping to see your orders here.'
                : 'No orders match this filter.'}
            </p>
            <Link
              href="/shop"
              className="auth-submit-btn cart-checkout-neon mt-8 inline-flex rounded-[10px] border-0 px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-white no-underline"
            >
              Start shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
