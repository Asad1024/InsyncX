import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AccountSidebar } from '@/components/account/AccountSidebar';

export const dynamic = 'force-dynamic';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/account');

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatar: true },
  });
  const image =
    dbUser?.avatar ?? (session.user as { image?: string | null }).image ?? null;

  return (
    <div
      className="min-h-[calc(100vh-64px)] grid grid-cols-1 md:grid-cols-[var(--account-w)_1fr] max-w-[var(--content-max)] mx-auto"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      <AccountSidebar
        user={{
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          role: session.user.role,
          image,
        }}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
