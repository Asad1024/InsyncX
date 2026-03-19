import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { VendorSidebar } from '@/components/vendor/VendorSidebar';
import { prisma } from '@/lib/prisma';

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/vendor');
  if (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN') redirect('/');

  let storeName: string | undefined;
  let storeSlug: string | undefined;
  if (session.user.role === 'VENDOR' || session.user.role === 'ADMIN') {
    const storeId = (session.user as { storeId?: string }).storeId;
    const store = storeId
      ? await prisma.store.findUnique({ where: { id: storeId }, select: { name: true, slug: true } })
      : await prisma.store.findFirst({ where: { ownerId: session.user.id }, select: { name: true, slug: true } });
    storeName = store?.name;
    storeSlug = store?.slug;
  }

  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: 'var(--sidebar-w) 1fr' }}>
      <VendorSidebar storeName={storeName} storeSlug={storeSlug} />
      <main className="bg-[var(--bg)] overflow-y-auto max-w-[1200px] mx-auto" style={{ padding: '40px 40px' }}>
        {children}
      </main>
    </div>
  );
}
