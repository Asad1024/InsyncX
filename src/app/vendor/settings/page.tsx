import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { ChangePasswordBlock } from '@/components/shared/ChangePasswordBlock';

export default async function VendorSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/vendor/settings');

  return (
    <div>
      <PageHeader title="Settings" subtitle="Account and security" />
      <div className="mt-8 max-w-xl">
        <ChangePasswordBlock userId={session.user.id} />
      </div>
    </div>
  );
}
