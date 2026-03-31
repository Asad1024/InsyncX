import { auth } from '@/lib/auth';
import { getOrdersForUser } from '@/actions/order.actions';
import Link from 'next/link';
import type { OrderStatus } from '@prisma/client';
import { OrderCard } from '@/components/account/OrderCard';
import { ShoppingBag } from 'lucide-react';

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
    <div className="py-10 px-12" style={{ padding: '40px 48px' }}>
      <div className="flex items-center justify-between mb-8">
        <h1
          className="font-display text-[40px] font-light"
          style={{ color: 'var(--text)' }}
        >
          My Orders
        </h1>
        <p className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-0 border-b mb-8" style={{ borderColor: 'var(--line)' }}>
        {TABS.map(({ value, label }) => {
          const isActive = statusFilter === value;
          const href = value ? `/account/orders?status=${value}` : '/account/orders';
          return (
            <Link
              key={value || 'all'}
              href={href}
              className="font-sans text-[13px] font-medium py-2.5 px-[18px] border-b-2 -mb-px transition-all duration-150 bg-transparent border-t-0 border-l-0 border-r-0"
              style={{
                color: isActive ? 'var(--gold)' : 'var(--text-3)',
                borderBottomColor: isActive ? 'var(--gold)' : 'transparent',
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16 px-6">
          <ShoppingBag
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: 'var(--text-4)' }}
          />
          <h2
            className="font-display text-[28px] font-light"
            style={{ color: 'var(--text)' }}
          >
            No orders yet
          </h2>
          <p className="font-sans text-[13px] mt-2" style={{ color: 'var(--text-3)' }}>
            {orders.length === 0
              ? 'Start shopping to see your orders here.'
              : 'No orders match this filter.'}
          </p>
          <Link
            href="/shop"
            className="btn btn-primary btn-sm mt-6 inline-block"
          >
            Start shopping
          </Link>
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
