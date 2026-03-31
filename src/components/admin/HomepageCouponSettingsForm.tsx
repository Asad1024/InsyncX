'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateHomepageCouponSection } from '@/actions/admin.actions';

type CouponOption = { id: string; code: string; type: string; discount: number; storeName: string | null };

export function HomepageCouponSettingsForm({
  initialEnabled,
  initialCouponIds,
  coupons,
}: {
  initialEnabled: boolean;
  initialCouponIds: string[];
  coupons: CouponOption[];
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialCouponIds));
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleCoupon = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateHomepageCouponSection(enabled, Array.from(selectedIds));
    if (res?.error) {
      toast({ title: res.error, variant: 'error' });
    } else {
      toast({ title: 'Homepage coupon section updated', variant: 'success' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-4 h-4 rounded border-[var(--line)] accent-[var(--gold)]"
        />
        <span className="font-sans text-[14px]" style={{ color: 'var(--text)' }}>
          Show coupon section on homepage
        </span>
      </label>
      <p className="font-sans text-[13px]" style={{ color: 'var(--text-3)' }}>
        Choose which coupons to feature. Only active, non-expired coupons with uses left will appear. The section is hidden when disabled or when no valid coupons are selected.
      </p>
      {coupons.length === 0 ? (
        <p className="font-sans text-[13px]" style={{ color: 'var(--text-4)' }}>
          No coupons yet. Create platform or store coupons first.
        </p>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2" style={{ borderColor: 'var(--line)' }}>
          {coupons.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg border cursor-pointer hover:bg-[var(--surface2)] transition-colors"
              style={{ borderColor: 'var(--line)' }}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(c.id)}
                onChange={() => toggleCoupon(c.id)}
                className="w-4 h-4 rounded border-[var(--line)] accent-[var(--gold)]"
              />
              <span className="font-mono text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                {c.code}
              </span>
              <span className="font-sans text-[12px]" style={{ color: 'var(--text-3)' }}>
                {c.type === 'PERCENT' ? `${c.discount}% off` : `$${c.discount} off`}
              </span>
              <span className="font-sans text-[11px]" style={{ color: 'var(--text-4)' }}>
                {c.storeName ?? 'Platform'}
              </span>
            </label>
          ))}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-sm"
      >
        {loading ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
