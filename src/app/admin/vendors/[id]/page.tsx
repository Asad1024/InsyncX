import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { StorePreviewReadOnly } from '@/components/admin/StorePreviewReadOnly';
import { ApproveStoreButton } from '@/components/admin/ApproveStoreButton';
import { DeclineStoreButton } from '@/components/admin/DeclineStoreButton';
import { StatsCard } from '@/components/shared/StatsCard';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingBag, DollarSign, CheckCircle, Clock, XCircle, User, ArrowRight } from 'lucide-react';

interface Props { params: Promise<{ id: string }> }

export default async function AdminVendorDetailPage({ params }: Props) {
  const { id } = await params;
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true } },
      products: { include: { category: { select: { name: true } } }, orderBy: { title: 'asc' }, take: 10 },
    },
  });
  if (!store) notFound();

  const [productCount, orderCount, revenueRows, orders] = await Promise.all([
    prisma.product.count({ where: { storeId: store.id } }),
    prisma.order.count({ where: { storeId: store.id } }),
    prisma.order.findMany({
      where: { storeId: store.id, status: { not: 'CANCELLED' } },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);
  const revenue = revenueRows.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div>
      <PageHeader
        title={store.name}
        subtitle="Vendor store details"
        actions={<Link href="/admin/vendors" className="btn btn-ghost btn-sm">Back to vendors</Link>}
      />

      <StorePreviewReadOnly
        store={{
          name: store.name,
          slug: store.slug,
          logo: store.logo,
          banner: store.banner,
        }}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Left: Owner, Products, Orders */}
        <div className="space-y-6">
          <section className="panel p-6">
            <h3 className="font-display text-[18px] font-normal mb-4" style={{ color: 'var(--text)' }}>
              Owner
            </h3>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--surface2)', border: '1px solid var(--line)' }}
              >
                <User className="w-5 h-5" style={{ color: 'var(--text-3)' }} />
              </div>
              <div>
                <p className="font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{store.owner.name}</p>
                <p className="font-sans text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>{store.owner.email}</p>
              </div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between py-5 px-6 border-b" style={{ borderColor: 'var(--line)' }}>
              <h3 className="font-display text-[18px] font-normal" style={{ color: 'var(--text)' }}>
                Products ({productCount})
              </h3>
              <Link href="/admin/products" className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium" style={{ color: 'var(--gold)' }}>
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {store.products.length === 0 ? (
              <p className="font-sans text-[13px] text-center py-8 px-6" style={{ color: 'var(--text-3)' }}>No products</p>
            ) : (
              <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
                {store.products.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3.5 px-6">
                    <Link href={`/admin/products/${p.id}`} className="font-sans text-[13px] font-medium hover:underline" style={{ color: 'var(--gold)' }}>
                      {p.title}
                    </Link>
                    <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>{formatPrice(Number(p.price))}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between py-5 px-6 border-b" style={{ borderColor: 'var(--line)' }}>
              <h3 className="font-display text-[18px] font-normal" style={{ color: 'var(--text)' }}>
                Recent orders
              </h3>
              <Link href="/admin/orders" className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium" style={{ color: 'var(--gold)' }}>
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="font-sans text-[13px] text-center py-8 px-6" style={{ color: 'var(--text-3)' }}>No orders</p>
            ) : (
              <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between py-3.5 px-6">
                    <Link href={`/admin/orders/${o.id}`} className="font-sans text-[13px] font-medium hover:underline" style={{ color: 'var(--gold)' }}>
                      #{o.id.slice(-8).toUpperCase()}
                    </Link>
                    <span className="font-sans text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{formatPrice(Number(o.total))}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: Status + stats */}
        <div className="space-y-6">
          <section className="panel p-6">
            <h3 className="font-display text-[18px] font-normal mb-4" style={{ color: 'var(--text)' }}>
              Store status
            </h3>
            <div className="flex flex-col gap-4">
              {store.isApproved ? (
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--green-bg)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: 'var(--green)' }} />
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>Approved</p>
                    <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>Store is live</p>
                  </div>
                </div>
              ) : store.declinedAt ? (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <XCircle className="w-5 h-5" style={{ color: 'var(--red)' }} />
                    </div>
                    <div>
                      <p className="font-sans text-[14px] font-semibold" style={{ color: 'var(--red)' }}>Declined</p>
                      <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                        Vendor can request approval again from their portal.
                      </p>
                      {store.declineReason && (
                        <p className="font-sans text-[12px] mt-1 italic" style={{ color: 'var(--text-4)' }}>
                          Reason: {store.declineReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <ApproveStoreButton storeId={store.id} />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'var(--amber-bg)', border: '1px solid rgba(56,189,248,0.2)' }}
                    >
                      <Clock className="w-5 h-5" style={{ color: 'var(--amber)' }} />
                    </div>
                    <div>
                      <p className="font-sans text-[14px] font-semibold" style={{ color: 'var(--amber)' }}>Pending</p>
                      <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>Awaiting approval</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ApproveStoreButton storeId={store.id} />
                    <DeclineStoreButton storeId={store.id} />
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="panel p-6">
            <h3 className="font-display text-[18px] font-normal mb-4" style={{ color: 'var(--text)' }}>
              At a glance
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <StatsCard label="Products" value={productCount} icon={Package} color="blue" />
              <StatsCard label="Orders" value={orderCount} icon={ShoppingBag} color="green" />
              <StatsCard label="Revenue" value={formatPrice(revenue)} icon={DollarSign} color="gold" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
