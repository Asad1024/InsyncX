import { auth } from '@/lib/auth';
import { getMe } from '@/actions/user.actions';
import { ProfileForm, ChangePasswordForm } from '@/components/account/ProfileForm';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await getMe(session.user.id);
  if (!user) return null;

  return (
    <div className="py-10 px-12" style={{ padding: '40px 48px' }}>
      <header className="mb-10">
        <h1
          className="font-display text-[40px] font-light"
          style={{ color: 'var(--text)' }}
        >
          Profile
        </h1>
        <p className="font-sans text-[13px] mt-0" style={{ color: 'var(--text-3)' }}>
          Manage your personal information
        </p>
      </header>

      <ProfileForm
        userId={user.id}
        user={{ name: user.name, email: user.email ?? '' }}
      />
      <ChangePasswordForm userId={user.id} />
    </div>
  );
}
