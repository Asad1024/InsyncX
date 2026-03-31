import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { CouponForm } from '@/components/shared/CouponForm';

export default async function VendorEditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;
  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!store) return <p className="text-[var(--text-3)]">No store.</p>;

  const coupon = await prisma.coupon.findFirst({
    where: { id, storeId: store.id },
  });
  if (!coupon) notFound();

  return (
    <div>
      <PageHeader
        title="Edit coupon"
        subtitle={coupon.code}
        actions={<Link href="/vendor/coupons" className="btn btn-ghost btn-sm">Back</Link>}
      />
      <CouponForm
        couponId={coupon.id}
        backHref="/vendor/coupons"
        backLabel="Back to coupons"
        fixedStoreId={store.id}
        initial={{
          code: coupon.code,
          type: coupon.type,
          discount: Number(coupon.discount),
          storeId: coupon.storeId,
          usageLimit: coupon.usageLimit,
          expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString().slice(0, 16) : null,
          isActive: coupon.isActive,
        }}
      />
    </div>
  );
}
