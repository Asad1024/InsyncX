'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile, changePassword } from '@/actions/user.actions';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

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
    <div className="card card-p-xl mb-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-[28px] font-normal" style={{ color: 'var(--text)' }}>
            Personal Information
          </h2>
          <p className="font-sans text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>
            Update your name and contact details
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="btn btn-ghost btn-sm"
          >
            Edit
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-group">
            <label htmlFor="profile-name" className="input-label">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={!editing}
              style={
                !editing
                  ? { opacity: 0.6, cursor: 'not-allowed', background: 'var(--surface3)' }
                  : undefined
              }
            />
          </div>
          <div className="input-group">
            <label htmlFor="profile-email" className="input-label">
              Email
            </label>
            <div className="flex items-center gap-2">
              <input
                id="profile-email"
                type="email"
                className="input"
                value={user.email}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed', background: 'var(--surface3)' }}
              />
              <Lock className="w-4 h-4 shrink-0" style={{ color: 'var(--text-4)' }} />
            </div>
            <p className="font-sans text-[11px] mt-1" style={{ color: 'var(--text-4)' }}>
              Cannot be changed
            </p>
          </div>
        </div>
        {editing && (
          <button type="submit" className="btn btn-primary mt-6" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
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
  const { toast } = useToast();
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
    <div className="card card-p-xl">
      <div className="mb-8">
        <h2 className="font-display text-[28px] font-normal" style={{ color: 'var(--text)' }}>
          Change Password
        </h2>
        <p className="font-sans text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>
          Update your password to keep your account secure
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="input-group">
          <label htmlFor="current-password" className="input-label">
            Current Password
          </label>
          <div className="relative">
            <input
              id="current-password"
              type={showCurrent ? 'text' : 'password'}
              className="input pr-11"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0 border-0 bg-transparent cursor-pointer"
              style={{ color: 'var(--text-4)' }}
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="new-password" className="input-label">
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNew ? 'text' : 'password'}
              className="input pr-11"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0 border-0 bg-transparent cursor-pointer"
              style={{ color: 'var(--text-4)' }}
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="confirm-password" className="input-label">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              className="input pr-11"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0 border-0 bg-transparent cursor-pointer"
              style={{ color: 'var(--text-4)' }}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 h-[3px] rounded-full"
                style={{
                  background: i < strength ? strengthColor[strength] : 'var(--surface3)',
                }}
              />
            ))}
          </div>
          <p className="font-sans text-[11px] mt-1" style={{ color: strengthColor[strength] }}>
            {strengthLabel[strength]}
          </p>
        </div>
        {message && (
          <div
            className="flex items-center gap-2 rounded-[10px] px-4 py-3 border"
            style={{
              background: message.type === 'error' ? 'var(--red-bg)' : 'var(--green-bg)',
              borderColor:
                message.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
            }}
          >
            {message.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--red)' }} />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--green)' }} />
            )}
            <span
              className="font-sans text-[13px]"
              style={{ color: message.type === 'error' ? 'var(--red)' : 'var(--green)' }}
            >
              {message.text}
            </span>
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
