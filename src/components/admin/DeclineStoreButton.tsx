'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { declineVendorStore } from '@/actions/admin.actions';
import { useToast } from '@/hooks/use-toast';
import { XCircle } from 'lucide-react';

export function DeclineStoreButton({ storeId }: { storeId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');

  const handleDecline = async () => {
    setLoading(true);
    const res = await declineVendorStore(storeId, reason || undefined);
    if (res?.error) {
      toast({ title: res.error, variant: 'error' });
    } else {
      toast({ title: 'Store declined', variant: 'default' });
      setShowForm(false);
      setReason('');
      router.refresh();
    }
    setLoading(false);
  };

  if (showForm) {
    return (
      <div className="mt-4 space-y-3 rounded-xl border p-4" style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}>
        <label className="block font-sans text-[13px] font-medium" style={{ color: 'var(--text)' }}>
          Reason (optional, shown to vendor)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Incomplete store profile"
          rows={2}
          className="w-full rounded-xl border px-3 py-2 font-sans text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          style={{ borderColor: 'var(--line)', background: 'var(--bg)', color: 'var(--text)' }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDecline}
            disabled={loading}
            className="rounded-xl px-4 py-2 font-sans text-[13px] font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Declining…' : 'Confirm decline'}
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setReason(''); }}
            disabled={loading}
            className="rounded-xl px-4 py-2 font-sans text-[13px] font-medium border hover:opacity-90"
            style={{ borderColor: 'var(--line)', color: 'var(--text-2)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowForm(true)}
      className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-[13px] font-semibold border hover:opacity-90"
      style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
    >
      <XCircle className="w-4 h-4" /> Decline store
    </button>
  );
}
