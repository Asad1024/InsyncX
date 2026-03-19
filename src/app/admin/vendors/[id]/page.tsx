import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface Props { params: Promise<{ id: string }> }

export default async function AdminVendorDetailPage({ params }: Props) {
  const { id } = await params;
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true } },
      products: { include: { category: { select: { name: true } } } },
    },
  });
  if (!store) notFound();

  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-white mb-2">{store.name}</h1>
      <p className="text-muted mb-6">Owner: {store.owner.name} · {store.owner.email}</p>
      <p className="mb-8">
        Status: <span className={store.isApproved ? 'text-emerald-400' : 'text-amber-400'}>{store.isApproved ? 'Approved' : 'Pending'}</span>
      </p>
      <h2 className="font-display text-lg text-white mb-4">Products ({store.products.length})</h2>
      <ul className="space-y-2 mb-8">
        {store.products.slice(0, 10).map((p) => (
          <li key={p.id} className="flex justify-between p-3 rounded border border-border bg-surface">
            <Link href={`/admin/products/${p.id}`} className="text-accent hover:underline">{p.title}</Link>
            <span className="text-muted">{formatPrice(Number(p.price))}</span>
          </li>
        ))}
      </ul>
      <h2 className="font-display text-lg text-white mb-4">Recent orders</h2>
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="flex justify-between p-3 rounded border border-border bg-surface">
            <Link href={`/admin/orders/${o.id}`} className="text-accent hover:underline">#{o.id.slice(-8).toUpperCase()}</Link>
            <span className="text-accent">{formatPrice(Number(o.total))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
