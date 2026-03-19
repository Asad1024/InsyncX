'use client';

import { AlertTriangle, AlertCircle } from 'lucide-react';

type Variant = 'danger' | 'warning';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  variant?: Variant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  title,
  description,
  variant = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  loading = false,
}: ConfirmModalProps) {
  if (!open) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-fade-in"
      style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] border rounded-[20px] p-8 max-w-[440px] w-full shadow-xl animate-fade-up"
        style={{
          borderColor: 'var(--line-md)',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 rounded-full mx-auto mb-5 flex items-center justify-center border"
          style={
            variant === 'danger'
              ? { background: 'var(--red-bg)', borderColor: 'rgba(239,68,68,0.2)' }
              : { background: 'var(--amber-bg)', borderColor: 'rgba(245,158,11,0.2)' }
          }
        >
          {variant === 'danger' ? (
            <AlertTriangle className="w-[22px] h-[22px]" style={{ color: 'var(--red)' }} />
          ) : (
            <AlertCircle className="w-[22px] h-[22px]" style={{ color: 'var(--amber)' }} />
          )}
        </div>
        <h2
          className="font-display text-[28px] font-normal text-center mb-2"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </h2>
        <p
          className="font-sans text-[14px] text-center leading-relaxed mb-8"
          style={{ color: 'var(--text-3)' }}
        >
          {description}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-full flex-1">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`btn btn-full flex-1 ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          >
            {loading ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
