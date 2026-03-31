import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/shared/PageHeader';
import { CouponForm } from '@/components/shared/CouponForm';

export default async function AdminNewCouponPage() {
  const stores = await prisma.store.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        title="New coupon"
        subtitle="Create a platform or store coupon"
        actions={<Link href="/admin/coupons" className="btn btn-ghost btn-sm">Back</Link>}
      />
      <CouponForm
        backHref="/admin/coupons"
        backLabel="Back to coupons"
        stores={stores}
      />
    </div>
  );
}
