import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { prisma } from '@/lib/prisma';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/admin');
  if (session.user.role !== 'ADMIN') redirect('/');

  const pendingVendorsCount = await prisma.store.count({ where: { isApproved: false } });

  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: 'var(--sidebar-w) 1fr' }}>
      <AdminSidebar pendingVendorsCount={pendingVendorsCount} />
      <main className="bg-[var(--bg)] overflow-y-auto min-h-screen w-full" style={{ padding: '32px 32px 48px' }}>
        {children}
      </main>
    </div>
  );
}
