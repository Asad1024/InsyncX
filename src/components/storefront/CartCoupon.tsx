'use client';

import { useState } from 'react';
import { applyCoupon } from '@/actions/coupon.actions';
import { useToast } from '@/hooks/use-toast';
import { Tag } from 'lucide-react';

interface CartCouponProps {
  productIds?: string[];
  onApplied?: (discount: number, code: string) => void;
}

const inputClass =
  'w-full bg-[var(--surface2)] border rounded-[10px] py-3 px-4 font-sans text-[14px] text-[var(--text)] placeholder:text-[var(--text-4)] outline-none transition-all duration-150 focus:border-[var(--line-gold)] focus:shadow-[0_0_0_3px_rgba(74,144,226,0.10)]';

export function CartCoupon({ productIds = [], onApplied }: CartCouponProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const res = await applyCoupon(code.trim(), undefined, productIds.length > 0 ? productIds : undefined);
    if (res?.error) {
      toast({ title: res.error, variant: 'error' });
    } else if (res && 'code' in res) {
      if ('fixedAmount' in res && res.fixedAmount != null && Number(res.fixedAmount) > 0) {
        onApplied?.(0, res.code);
        toast({ title: 'Coupon applied', variant: 'success' });
      } else if ('discount' in res && res.discount != null && res.discount > 0) {
        onApplied?.(res.discount, res.code);
        toast({ title: `Coupon applied: ${res.discount}% off`, variant: 'success' });
      } else {
        onApplied?.(0, res.code);
        toast({ title: 'Coupon applied', variant: 'success' });
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2 mb-4">
      <div className="relative flex-1 min-w-0">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-4)] pointer-events-none" />
        <input
          type="text"
          placeholder="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className={`${inputClass} pl-10`}
          style={{ borderColor: 'var(--line)' }}
        />
      </div>
      <button
        type="button"
        onClick={handleApply}
        disabled={loading}
        className="font-sans text-[11px] font-semibold uppercase tracking-wider px-4 py-3 rounded-[10px] border transition-colors disabled:opacity-50 shrink-0"
        style={{ borderColor: 'var(--line-gold)', color: 'var(--gold)', background: 'var(--gold-bg)' }}
      >
        {loading ? '…' : 'Apply'}
      </button>
    </div>
  );
}
