import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { ListSearchFilter } from '@/components/shared/ListSearchFilter';

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const store = await prisma.store.findFirst({
    where: session.user.role === 'ADMIN' && (session.user as { storeId?: string }).storeId
      ? { id: (session.user as { storeId: string }).storeId }
      : { ownerId: session.user.id },
  });
  if (!store && session.user.role === 'VENDOR') return <p className="text-[var(--text-3)]">No store.</p>;
  const orders = await prisma.order.findMany({
    where: { storeId: store!.id },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const { status: statusParam, search: searchParam = '' } = await searchParams;
  let filtered =
    statusParam && ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(statusParam)
      ? orders.filter((o) => o.status === statusParam)
      : orders;
  if (searchParam.trim()) {
    const q = searchParam.trim().toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        (o.user.name?.toLowerCase().includes(q)) ||
        (o.user.email?.toLowerCase().includes(q))
    );
  }

  const tabs = [
    { label: 'All', href: '/vendor/orders' },
    { label: 'Pending', href: '/vendor/orders?status=PENDING' },
    { label: 'Confirmed', href: '/vendor/orders?status=CONFIRMED' },
    { label: 'Shipped', href: '/vendor/orders?status=SHIPPED' },
    { label: 'Delivered', href: '/vendor/orders?status=DELIVERED' },
  ];

  return (
    <div>
      <PageHeader title="Orders" subtitle="Manage and track your orders" />
      <div className="flex gap-0 border-b mb-6 mt-8" style={{ borderColor: 'var(--line)' }}>
        {tabs.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`font-sans text-[13px] font-medium py-2.5 px-[18px] border-b-2 -mb-px transition-all ${
              (href === '/vendor/orders' && !statusParam) || (statusParam && href.includes(statusParam))
                ? 'text-[var(--gold)] border-b-[var(--gold)]'
                : 'text-[var(--text-3)] border-b-transparent'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <ListSearchFilter basePath="/vendor/orders" placeholder="Search by order # or customer…" currentSearch={searchParam} />
      <div className="panel overflow-hidden">
      <DataTable empty={filtered.length === 0} emptyTitle="No orders" emptySubtitle="Orders will appear here.">
        <table className="w-full border-collapse">
          <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}>Order #</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}>Customer</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}>Date</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}>Items</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}>Total</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}>Status</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-4)' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr
                key={order.id}
                className="border-b transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                style={{ borderColor: 'var(--line)' }}
              >
                <td className="py-3.5 px-4 font-sans text-[13px] font-semibold" style={{ color: 'var(--gold)' }}>
                  #{order.id.slice(-8).toUpperCase()}
                </td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{order.user.name}</td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>—</td>
                <td className="py-3.5 px-4 font-sans text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{formatPrice(Number(order.total))}</td>
                <td className="py-3.5 px-4"><StatusBadge status={order.status} /></td>
                <td className="py-3.5 px-4">
                  <Link href={`/vendor/orders/${order.id}`} className="btn btn-ghost btn-sm">
                    Update
                  </Link>
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
