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
    <div className="account-dashboard-bg min-h-[calc(100vh-var(--nav-h))]">
      <div className="relative z-[1] mx-auto flex min-h-[calc(100vh-var(--nav-h))] max-w-[var(--content-max)] flex-col md:grid md:min-h-[calc(100vh-var(--nav-h))] md:grid-cols-[var(--account-w)_1fr]">
        <AccountSidebar
          user={{
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            role: session.user.role,
            image,
          }}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
