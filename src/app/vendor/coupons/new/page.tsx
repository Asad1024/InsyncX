import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { CouponForm } from '@/components/shared/CouponForm';

export default async function VendorNewCouponPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!store) return <p className="text-[var(--text-3)]">No store.</p>;

  return (
    <div>
      <PageHeader
        title="New coupon"
        subtitle="Create a discount for your store"
        actions={<Link href="/vendor/coupons" className="btn btn-ghost btn-sm">Back</Link>}
      />
      <CouponForm
        backHref="/vendor/coupons"
        backLabel="Back to coupons"
        fixedStoreId={store.id}
      />
    </div>
  );
}
