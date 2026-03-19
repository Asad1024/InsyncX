'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { changePassword } from '@/actions/user.actions';
import { useToast } from '@/hooks/use-toast';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export function ChangePasswordModal({ open, onClose, userId }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'New passwords do not match', variant: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'New password must be at least 8 characters', variant: 'error' });
      return;
    }
    setLoading(true);
    const res = await changePassword(userId, currentPassword, newPassword);
    setLoading(false);
    if (res?.error) {
      toast({ title: res.error, variant: 'error' });
      return;
    }
    toast({ title: 'Password updated', variant: 'success' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
    router.refresh();
  };

  const inputClass = 'w-full rounded-lg border bg-[var(--surface2)] px-3 py-2.5 font-sans text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]';
  const labelClass = 'font-sans text-[12px] font-medium block mb-1.5';
  const borderStyle = { borderColor: 'var(--line)' };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] border rounded-2xl p-8 max-w-[400px] w-full shadow-xl"
        style={{ borderColor: 'var(--line-md)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-[22px] font-normal mb-1" style={{ color: 'var(--text)' }}>
          Change password
        </h2>
        <p className="font-sans text-[13px] mb-6" style={{ color: 'var(--text-3)' }}>
          Enter your current password and choose a new one.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-current-password" className={labelClass} style={{ color: 'var(--text-2)' }}>
              Current password
            </label>
            <div className="relative">
              <input
                id="modal-current-password"
                type={showCurrent ? 'text' : 'password'}
                className={`${inputClass} pr-10`}
                style={borderStyle}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 border-0 bg-transparent cursor-pointer"
                style={{ color: 'var(--text-4)' }}
                aria-label={showCurrent ? 'Hide' : 'Show'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="modal-new-password" className={labelClass} style={{ color: 'var(--text-2)' }}>
              New password
            </label>
            <div className="relative">
              <input
                id="modal-new-password"
                type={showNew ? 'text' : 'password'}
                className={`${inputClass} pr-10`}
                style={borderStyle}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 border-0 bg-transparent cursor-pointer"
                style={{ color: 'var(--text-4)' }}
                aria-label={showNew ? 'Hide' : 'Show'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="modal-confirm-password" className={labelClass} style={{ color: 'var(--text-2)' }}>
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="modal-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                className={`${inputClass} pr-10`}
                style={borderStyle}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 border-0 bg-transparent cursor-pointer"
                style={{ color: 'var(--text-4)' }}
                aria-label={showConfirm ? 'Hide' : 'Show'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-sans text-[13px] font-semibold border transition-colors"
              style={{ borderColor: 'var(--line)', color: 'var(--text-2)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-sans text-[13px] font-semibold bg-[var(--gold)] text-black hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
