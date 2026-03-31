'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveVendorStore } from '@/actions/admin.actions';
import { useToast } from '@/hooks/use-toast';

export function ApproveStoreButton({ storeId }: { storeId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleApprove = async () => {
    setLoading(true);
    const res = await approveVendorStore(storeId);
    if (res?.error) toast({ title: res.error, variant: 'error' });
    else { toast({ title: 'Store approved', variant: 'success' }); router.refresh(); }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleApprove}
      disabled={loading}
      className="rounded-xl px-4 py-2.5 font-sans text-[13px] font-semibold bg-[var(--gold)] text-white hover:opacity-90 disabled:opacity-60"
    >
      {loading ? 'Approving…' : 'Approve store'}
    </button>
  );
}
