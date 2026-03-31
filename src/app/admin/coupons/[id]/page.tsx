import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { CouponForm } from '@/components/shared/CouponForm';

export default async function AdminEditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();

  const stores = await prisma.store.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        title="Edit coupon"
        subtitle={coupon.code}
        actions={<Link href="/admin/coupons" className="btn btn-ghost btn-sm">Back</Link>}
      />
      <CouponForm
        couponId={coupon.id}
        backHref="/admin/coupons"
        backLabel="Back to coupons"
        stores={stores}
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
