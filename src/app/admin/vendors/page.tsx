import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/PageHeader';
import { ListSearchFilter } from '@/components/shared/ListSearchFilter';
import { ApproveVendor } from '@/components/admin/ApproveVendor';
import { Package, ShoppingBag } from 'lucide-react';

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; search?: string }>;
}) {
  const { filter, search = '' } = await searchParams;
  const storesRaw = await prisma.store.findMany({
    where: filter === 'pending' ? { isApproved: false } : filter === 'approved' ? { isApproved: true, isOfficial: false } : { isOfficial: false },
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stores = search.trim()
    ? storesRaw.filter((s) => {
        const q = search.trim().toLowerCase();
        return s.name.toLowerCase().includes(q) || s.owner.name.toLowerCase().includes(q) || s.owner.email.toLowerCase().includes(q);
      })
    : storesRaw;

  const tabs = [
    { label: 'All', href: '/admin/vendors' },
    { label: 'Pending', href: '/admin/vendors?filter=pending' },
    { label: 'Approved', href: '/admin/vendors?filter=approved' },
  ];

  return (
    <div>
      <PageHeader title="Vendor stores" subtitle="Approve and manage vendor storefronts" />
      <div className="flex gap-0 border-b mb-6 mt-8" style={{ borderColor: 'var(--line)' }}>
        {tabs.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`font-sans text-[13px] font-medium py-2.5 px-[18px] border-b-2 -mb-px transition-all ${
              (href === '/admin/vendors' && !filter) || (filter && href.includes(filter))
                ? 'text-[var(--gold)] border-b-[var(--gold)]'
                : 'text-[var(--text-3)] border-b-transparent'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <ListSearchFilter basePath="/admin/vendors" placeholder="Search by store or owner name…" currentSearch={search} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((s) => (
          <div key={s.id} className="panel overflow-hidden">
            <div className="relative overflow-hidden" style={{ aspectRatio: '16/6', background: 'var(--surface3)' }}>
              {s.banner ? (
                <Image src={s.banner} alt="" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f1a] to-[#1a1a3a]" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ background: 'var(--gold-bg)' }}
                  >
                    {s.logo ? (
                      <Image src={s.logo} alt="" width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <span className="font-display text-[16px] font-normal" style={{ color: 'var(--gold)' }}>{s.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>{s.name}</p>
                    <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>{s.owner.name}</p>
                  </div>
                </div>
                <span className={s.isApproved ? 'badge badge-green' : s.declinedAt ? 'badge badge-red' : 'badge badge-amber'}>
                  {s.isApproved ? 'Approved' : s.declinedAt ? 'Declined' : 'Pending'}
                </span>
              </div>
              <div className="flex gap-4 mb-4">
                <span className="font-sans text-[12px] flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                  <Package className="w-3 h-3" /> {s._count.products} Products
                </span>
                <span className="font-sans text-[12px] flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                  <ShoppingBag className="w-3 h-3" /> {s._count.orders} Orders
                </span>
              </div>
              <div className="flex gap-2">
                {!s.isApproved && <ApproveVendor storeId={s.id} />}
                {!s.isApproved && s.declinedAt && (
                  <Link href={`/admin/vendors/${s.id}`} className="btn btn-ghost btn-sm text-[var(--red)]">
                    Review again
                  </Link>
                )}
                <Link href={`/admin/vendors/${s.id}`} className="btn btn-ghost btn-sm">
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
