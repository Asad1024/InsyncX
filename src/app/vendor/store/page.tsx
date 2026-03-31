import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/shared/PageHeader';
import { StoreForm } from '@/components/vendor/StoreForm';
import { StorePreviewCard } from '@/components/vendor/StorePreviewCard';
import { RequestApprovalAgainButton } from '@/components/vendor/RequestApprovalAgainButton';
import { StatsCard } from '@/components/shared/StatsCard';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingBag, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';

export default async function VendorStorePage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!store) {
    return (
      <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}>
        <p className="font-sans text-[15px]" style={{ color: 'var(--text-3)' }}>No store found. Contact support to get set up.</p>
      </div>
    );
  }

  const [productCount, orderCount, revenueRows] = await Promise.all([
    prisma.product.count({ where: { storeId: store.id } }),
    prisma.order.count({ where: { storeId: store.id, status: { not: 'CANCELLED' } } }),
    prisma.order.findMany({
      where: { storeId: store.id, status: { not: 'CANCELLED' } },
      select: { total: true },
    }),
  ]);
  const revenue = revenueRows.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div>
      <PageHeader
        title="Store settings"
        subtitle="Manage your storefront, branding, and view key stats"
      />

      <StorePreviewCard
        store={{
          id: store.id,
          name: store.name,
          slug: store.slug,
          logo: store.logo,
          banner: store.banner,
        }}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Left: Store information form */}
        <div className="space-y-8">
          <section className="panel p-6 lg:p-8">
            <h3 className="font-display text-[20px] font-normal mb-1" style={{ color: 'var(--text)' }}>
              Store information
            </h3>
            <p className="font-sans text-[13px] mb-6" style={{ color: 'var(--text-3)' }}>
              Name, URL slug, and description. Changes apply to your public storefront.
            </p>
            <StoreForm
              store={{
                id: store.id,
                name: store.name,
                slug: store.slug,
                description: store.description ?? '',
                logo: store.logo ?? '',
                banner: store.banner ?? '',
              }}
            />
          </section>
        </div>

        {/* Right: Status + stats */}
        <div className="space-y-6">
          <section className="panel p-6">
            <h3 className="font-display text-[18px] font-normal mb-4" style={{ color: 'var(--text)' }}>
              Store status
            </h3>
            <div className="flex items-center gap-3">
              {store.isApproved ? (
                <>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--green-bg)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: 'var(--green)' }} />
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>
                      Live
                    </p>
                    <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                      Your store is visible to customers
                    </p>
                  </div>
                </>
              ) : store.declinedAt ? (
                <>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <XCircle className="w-5 h-5" style={{ color: 'var(--red)' }} />
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-semibold" style={{ color: 'var(--red)' }}>
                      Request declined
                    </p>
                    <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                      Your store approval request was declined. You can request approval again below.
                    </p>
                    {store.declineReason && (
                      <p className="font-sans text-[12px] mt-1" style={{ color: 'var(--text-4)' }}>
                        Reason: {store.declineReason}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--amber-bg)', border: '1px solid rgba(56,189,248,0.2)' }}
                  >
                    <Clock className="w-5 h-5" style={{ color: 'var(--amber)' }} />
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-semibold" style={{ color: 'var(--amber)' }}>
                      Pending approval
                    </p>
                    <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                      We&apos;ll notify you once your store is approved
                    </p>
                  </div>
                </>
              )}
            </div>
            {store.declinedAt && (
              <div className="mt-4">
                <RequestApprovalAgainButton storeId={store.id} />
              </div>
            )}
            {!store.isApproved && !store.declinedAt && (
              <div
                className="mt-4 rounded-xl py-3 px-4 font-sans text-[13px] leading-relaxed"
                style={{ background: 'var(--amber-bg)', border: '1px solid rgba(56,189,248,0.15)', color: 'var(--text-2)' }}
              >
                Your store is under review. You can still add products and edit settings.
              </div>
            )}
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
