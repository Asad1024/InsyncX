import { auth } from '@/lib/auth';
import { getMe } from '@/actions/user.actions';
import { ProfileForm, ChangePasswordForm } from '@/components/account/ProfileForm';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await getMe(session.user.id);
  if (!user) return null;

  return (
    <div className="px-4 py-8 md:px-8 lg:px-10 xl:px-12">
      <header className="mb-8 md:mb-10">
        <h1 className="account-name-gradient text-[clamp(28px,5vw,44px)] leading-tight">Profile</h1>
        <p className="mt-1 font-sans text-[13px] text-[var(--muted)]">Manage your personal information</p>
      </header>

      <ProfileForm
        userId={user.id}
        user={{ name: user.name, email: user.email ?? '' }}
      />
      <ChangePasswordForm userId={user.id} />
    </div>
  );
}
