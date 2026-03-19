import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ListSearchFilter } from '@/components/shared/ListSearchFilter';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search = '', status } = await searchParams;
  const ordersRaw = await prisma.order.findMany({
    include: { store: { select: { name: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  let orders = ordersRaw;
  if (status && ORDER_STATUSES.some((s) => s.value === status)) {
    orders = orders.filter((o) => o.status === status);
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.store.name.toLowerCase().includes(q) ||
        (o.user.name?.toLowerCase().includes(q)) ||
        (o.user.email?.toLowerCase().includes(q))
    );
  }

  return (
    <div>
      <PageHeader title="Orders" subtitle="View and manage all platform orders" />
      <ListSearchFilter
        basePath="/admin/orders"
        placeholder="Search by order #, store, customer…"
        currentSearch={search}
        filters={[{ param: 'status', label: 'All statuses', options: ORDER_STATUSES }]}
        currentFilters={status ? { status } : {}}
      />
      <div className="panel overflow-hidden mt-8">
      <DataTable empty={orders.length === 0} emptyTitle="No orders">
        <table className="w-full border-collapse">
          <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Order #</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Store</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Customer</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Total</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Status</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                <td className="py-3.5 px-4 font-sans text-[13px] font-semibold" style={{ color: 'var(--gold)' }}>#{o.id.slice(-8).toUpperCase()}</td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{o.store.name}</td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{o.user.name}</td>
                <td className="py-3.5 px-4 font-sans text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{formatPrice(Number(o.total))}</td>
                <td className="py-3.5 px-4"><StatusBadge status={o.status} className="!px-4 !py-2" /></td>
                <td className="py-3.5 px-4">
                  <Link href={`/admin/orders/${o.id}`} className="btn btn-ghost btn-sm">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
      </div>
    </div>
  );
}
