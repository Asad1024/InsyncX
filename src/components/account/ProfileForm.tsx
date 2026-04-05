'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile, changePassword } from '@/actions/user.actions';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

function passwordStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0;
  let n = 0;
  if (pwd.length >= 8) n++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) n++;
  if (/\d/.test(pwd)) n++;
  if (/[^a-zA-Z0-9]/.test(pwd)) n++;
  return Math.min(4, n) as 0 | 1 | 2 | 3 | 4;
}

const strengthLabel: Record<number, string> = { 0: 'Weak', 1: 'Weak', 2: 'Fair', 3: 'Good', 4: 'Strong' };
const strengthColor: Record<number, string> = {
  0: 'var(--surface3)',
  1: 'var(--red)',
  2: 'var(--amber)',
  3: 'var(--gold)',
  4: 'var(--green)',
};

const floatingInput =
  'peer w-full rounded-xl border border-white/10 bg-[rgba(29,110,255,0.06)] px-3 pb-2.5 pt-5 text-[15px] text-[var(--white)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-transparent focus:border-[var(--cyan)]/45 focus:shadow-[0_0_0_3px_rgba(0,200,255,0.08)] disabled:cursor-not-allowed disabled:opacity-55';

const floatingLabel =
  'pointer-events-none absolute left-3 top-1/2 origin-[0] -translate-y-1/2 font-sans text-[13px] text-[var(--muted)] transition-all duration-200 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.12em] peer-focus:text-[var(--cyan)] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.12em]';

export function ProfileForm({ userId, user }: { userId: string; user: { name: string; email: string } }) {
  const [name, setName] = useState(user.name);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(userId, { name });
      toast({ title: 'Profile updated', variant: 'success' });
      router.refresh();
      setEditing(false);
    } catch {
      toast({ title: 'Could not update profile', variant: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="account-glass-panel mb-6 p-6 md:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[22px] font-bold text-[var(--white)] md:text-[26px]">
            Personal Information
          </h2>
          <p className="mt-1 font-sans text-[13px] text-[var(--muted)]">Update your name and contact details</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full border border-white/12 bg-[rgba(255,255,255,0.05)] px-4 py-2 font-sans text-[12px] font-medium text-[var(--cyan)] transition-colors hover:border-[var(--cyan)]/40"
          >
            Edit
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="relative">
            <input
              id="profile-name"
              type="text"
              className={floatingInput}
              placeholder=" "
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={!editing}
            />
            <label htmlFor="profile-name" className={floatingLabel}>
              Full name
            </label>
          </div>
          <div>
            <div className="relative">
              <input
                id="profile-email"
                type="email"
                className={cn(floatingInput, 'pr-11')}
                placeholder=" "
                value={user.email}
                disabled
                readOnly
              />
              <label htmlFor="profile-email" className={floatingLabel}>
                Email
              </label>
              <Lock
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
                aria-hidden
              />
            </div>
            <p className="mt-1.5 font-sans text-[11px] text-[var(--muted)]">Cannot be changed</p>
          </div>
        </div>
        {editing && (
          <button
            type="submit"
            className="auth-submit-btn mt-6 rounded-[10px] border-0 px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        )}
      </form>
    </div>
  );
}

export function ChangePasswordForm({ userId }: { userId: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const router = useRouter();
  const strength = useMemo(() => passwordStrength(newPassword), [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    setLoading(true);
    const res = await changePassword(userId, currentPassword, newPassword);
    if (res?.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="account-glass-panel p-6 md:p-8">
      <div className="mb-8">
        <h2 className="font-display text-[22px] font-bold text-[var(--white)] md:text-[26px]">
          Change Password
        </h2>
        <p className="mt-1 font-sans text-[13px] text-[var(--muted)]">
          Update your password to keep your account secure
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="relative">
          <input
            id="current-password"
            type={showCurrent ? 'text' : 'password'}
            className={cn(floatingInput, 'pr-11')}
            placeholder=" "
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <label htmlFor="current-password" className={floatingLabel}>
            Current password
          </label>
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-1 text-[var(--muted)] hover:text-[var(--white)]"
            aria-label={showCurrent ? 'Hide password' : 'Show password'}
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="relative">
          <input
            id="new-password"
            type={showNew ? 'text' : 'password'}
            className={cn(floatingInput, 'pr-11')}
            placeholder=" "
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <label htmlFor="new-password" className={floatingLabel}>
            New password
          </label>
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-1 text-[var(--muted)] hover:text-[var(--white)]"
            aria-label={showNew ? 'Hide password' : 'Show password'}
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirm ? 'text' : 'password'}
            className={cn(floatingInput, 'pr-11')}
            placeholder=" "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <label htmlFor="confirm-password" className={floatingLabel}>
            Confirm new password
          </label>
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-1 text-[var(--muted)] hover:text-[var(--white)]"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <div className="mt-3 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[3px] flex-1 rounded-full"
                style={{
                  background: i < strength ? strengthColor[strength] : 'var(--surface3)',
                }}
              />
            ))}
          </div>
          <p className="mt-1 font-sans text-[11px]" style={{ color: strengthColor[strength] }}>
            {strengthLabel[strength]}
          </p>
        </div>
        {message && (
          <div
            className="flex items-center gap-2 rounded-[10px] border px-4 py-3"
            style={{
              background: message.type === 'error' ? 'var(--red-bg)' : 'var(--green-bg)',
              borderColor:
                message.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
            }}
          >
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--red)' }} />
            ) : (
              <CheckCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--green)' }} />
            )}
            <span
              className="font-sans text-[13px]"
              style={{ color: message.type === 'error' ? 'var(--red)' : 'var(--green)' }}
            >
              {message.text}
            </span>
          </div>
        )}
        <button
          type="submit"
          className="auth-submit-btn cart-checkout-neon w-full rounded-[10px] border-0 py-3.5 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
