'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveVendorStore } from '@/actions/admin.actions';
import { useToast } from '@/hooks/use-toast';

export function ApproveVendor({ storeId }: { storeId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    const res = await approveVendorStore(storeId);
    if (res?.error) {
      toast({ title: res.error, variant: 'error' });
    } else {
      toast({ title: 'Store approved', variant: 'default' });
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleApprove}
      disabled={loading}
      className="rounded-xl px-3 py-2 font-sans text-[13px] font-semibold bg-[var(--gold)] text-black hover:opacity-90 disabled:opacity-60"
    >
      {loading ? 'Approving…' : 'Approve'}
    </button>
  );
}
