'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCoupon } from '@/actions/coupon.actions';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

export function DeleteCouponButton({ couponId, code }: { couponId: string; code: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteCoupon(couponId);
    setLoading(false);
    if (res?.error) toast({ title: res.error, variant: 'error' });
    else {
      toast({ title: 'Coupon deleted', variant: 'success' });
      router.refresh();
    }
    setConfirming(false);
  };

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="font-sans text-[12px] font-medium px-2 py-1 rounded border cursor-pointer disabled:opacity-50"
          style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
        >
          {loading ? '…' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="font-sans text-[12px] font-medium px-2 py-1 rounded border cursor-pointer"
          style={{ borderColor: 'var(--line)', color: 'var(--text-3)' }}
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded border border-transparent hover:border-[var(--red)] cursor-pointer transition-colors"
      style={{ color: 'var(--text-4)' }}
      title={`Delete ${code}`}
      aria-label={`Delete coupon ${code}`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
