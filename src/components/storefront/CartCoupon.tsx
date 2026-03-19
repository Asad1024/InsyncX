'use client';

import { useState } from 'react';
import { applyCoupon } from '@/actions/coupon.actions';
import { useToast } from '@/hooks/use-toast';

interface CartCouponProps {
  onApplied?: (discount: number, code: string) => void;
}

export function CartCoupon({ onApplied }: CartCouponProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const res = await applyCoupon(code.trim());
    if (res?.error) {
      toast({ title: res.error, variant: 'error' });
    } else if (res?.discount != null) {
      onApplied?.(res.discount, code.trim());
      toast({ title: `Coupon applied: ${res.discount}% off`, variant: 'success' });
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Coupon code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        className="flex-1 min-w-0 bg-transparent border-0 border-b py-2 px-0 font-sans text-[14px] text-[#f0ede6] placeholder:text-[#444440] focus:outline-none focus:border-[#c9a96e] transition-colors"
        style={{ borderBottomWidth: '1px', borderBottomColor: 'rgba(201,169,110,0.3)' }}
      />
      <button
        type="button"
        onClick={handleApply}
        disabled={loading}
        className="font-sans text-[11px] font-semibold uppercase tracking-wider px-4 py-2 border text-[#c9a96e] hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
        style={{ borderColor: 'rgba(201,169,110,0.25)' }}
      >
        {loading ? '…' : 'Apply'}
      </button>
    </div>
  );
}
