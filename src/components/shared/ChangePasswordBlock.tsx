'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

interface ChangePasswordBlockProps {
  userId: string;
}

export function ChangePasswordBlock({ userId }: ChangePasswordBlockProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="panel p-6 lg:p-8">
        <h2 className="font-display text-[20px] font-normal mb-1" style={{ color: 'var(--text)' }}>
          Password
        </h2>
        <p className="font-sans text-[13px] mb-6" style={{ color: 'var(--text-3)' }}>
          Change your account password to keep it secure.
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-[13px] font-semibold border transition-colors"
          style={{ borderColor: 'var(--line-gold)', background: 'var(--gold-bg)', color: 'var(--gold)' }}
        >
          <Lock className="w-4 h-4" />
          Change password
        </button>
      </div>
      <ChangePasswordModal open={modalOpen} onClose={() => setModalOpen(false)} userId={userId} />
    </>
  );
}
