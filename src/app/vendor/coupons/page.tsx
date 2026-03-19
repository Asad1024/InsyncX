import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Plus } from 'lucide-react';

export default async function VendorCouponsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!store) return <p className="text-[var(--text-3)]">No store.</p>;
  const coupons = await prisma.coupon.findMany({
    where: { storeId: store.id },
  });

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle="Manage your store discounts"
        actions={
          <Link href="/vendor/coupons/new" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Create Coupon
          </Link>
        }
      />
      <DataTable empty={coupons.length === 0} emptyTitle="No coupons" emptySubtitle="Create a coupon to offer discounts.">
        <table className="w-full border-collapse">
          <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--line)' }}>
            <tr>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Code</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Type</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Discount</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Usage</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Expires</th>
              <th className="py-3 px-4 text-left font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b" style={{ borderColor: 'var(--line)' }}>
                <td className="py-3.5 px-4 font-sans text-[13px] font-semibold font-mono" style={{ color: 'var(--gold)' }}>{c.code}</td>
                <td className="py-3.5 px-4"><span className="badge badge-neutral">{c.type}</span></td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-2)' }}>{c.discount}{c.type === 'PERCENT' ? '%' : ''}</td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>{c.usedCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}</td>
                <td className="py-3.5 px-4 font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                <td className="py-3.5 px-4">
                  <span className={c.expiresAt && new Date(c.expiresAt) < new Date() ? 'badge badge-red' : 'badge badge-green'}>
                    {c.expiresAt && new Date(c.expiresAt) < new Date() ? 'Expired' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
