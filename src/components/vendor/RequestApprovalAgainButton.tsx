'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestApprovalAgain } from '@/actions/store.actions';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

export function RequestApprovalAgainButton({ storeId }: { storeId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const res = await requestApprovalAgain(storeId);
    if (res?.error) {
      toast({ title: res.error, variant: 'error' });
    } else {
      toast({ title: 'Request sent. Your store is back in review.', variant: 'default' });
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-[13px] font-semibold bg-[var(--gold)] text-white hover:opacity-90 disabled:opacity-60"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Submitting…' : 'Request approval again'}
    </button>
  );
}
