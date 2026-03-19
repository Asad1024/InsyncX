import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/shared/PageHeader';
import { StoreForm } from '@/components/vendor/StoreForm';
import { PayoutRequest } from '@/components/vendor/PayoutRequest';
import { formatPrice } from '@/lib/utils';
import { Camera, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default async function VendorStorePage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!store) return <p className="text-[var(--text-3)]">No store found.</p>;

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
      <PageHeader title="Store Settings" subtitle="Customize your storefront" />
      <div className="grid gap-8" style={{ gridTemplateColumns: '60% 1fr' }}>
        <div>
          <div className="card overflow-hidden mb-5">
            <h2 className="font-display text-[22px] font-normal py-5 px-6" style={{ color: 'var(--text)' }}>Store Banner</h2>
            <div
              className="relative overflow-hidden border-b"
              style={{ aspectRatio: '16/5', background: 'var(--surface3)', borderColor: 'var(--line)' }}
            >
              {store.banner ? (
                <Image src={store.banner} alt="" fill className="object-cover" />
              ) : (
                <p className="absolute inset-0 flex items-center justify-center font-sans text-[13px]" style={{ color: 'var(--text-4)' }}>No banner uploaded</p>
              )}
              <div className="absolute bottom-3 right-3">
                <button type="button" className="btn btn-ghost btn-sm bg-black/70">
                  <Camera className="w-3.5 h-3.5" /> Change Banner
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 py-5 px-6">
              <div
                className="w-14 h-14 rounded-full border-2 overflow-hidden shrink-0 flex items-center justify-center"
                style={{ borderColor: 'var(--line)', background: 'var(--gold-bg)' }}
              >
                {store.logo ? (
                  <Image src={store.logo} alt="" width={56} height={56} className="object-cover w-full h-full" />
                ) : (
                  <span className="font-display text-[22px] font-normal" style={{ color: 'var(--gold)' }}>{store.name.slice(0, 1)}</span>
                )}
              </div>
              <h2 className="font-display text-[22px] font-normal" style={{ color: 'var(--text)' }}>{store.name}</h2>
            </div>
          </div>
          <div className="card card-p-lg mb-5">
            <h2 className="font-display text-[22px] font-normal mb-6" style={{ color: 'var(--text)' }}>Store Information</h2>
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
          </div>
        </div>
        <div className="space-y-4">
          <div className="card card-p">
            <h2 className="font-display text-[20px] font-normal mb-4" style={{ color: 'var(--text)' }}>Store Status</h2>
            <div className="flex items-center gap-2.5 mb-4">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: store.isApproved ? 'var(--green)' : 'var(--amber)' }}
              />
              <span className="font-sans text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                {store.isApproved ? 'Live' : 'Pending Approval'}
              </span>
            </div>
            {!store.isApproved && (
              <div
                className="rounded-[10px] py-3.5 px-4 font-sans text-[13px] leading-relaxed"
                style={{ background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--amber)' }}
              >
                Your store is pending admin review. We&apos;ll notify you once approved.
              </div>
            )}
          </div>
          <div className="card card-p">
            <h2 className="font-display text-[20px] font-normal mb-5" style={{ color: 'var(--text)' }}>Your Store</h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>Products</span>
                <span className="font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{productCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>Total Orders</span>
                <span className="font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{orderCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>Revenue</span>
                <span className="font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{formatPrice(revenue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
