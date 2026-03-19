'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createCoupon, updateCoupon, type CouponFormData } from '@/actions/coupon.actions';
import { useToast } from '@/hooks/use-toast';
import { Percent, DollarSign, Tag } from 'lucide-react';

interface CouponFormProps {
  couponId?: string;
  initial?: Partial<CouponFormData> & { expiresAt?: string | null };
  /** For vendor: their store ID (no store picker). For admin: undefined = show store dropdown */
  fixedStoreId?: string | null;
  /** For admin: list of { id, name } to assign coupon to a store or "Platform" */
  stores?: Array<{ id: string; name: string }>;
  backHref: string;
  backLabel: string;
}

export function CouponForm({
  couponId,
  initial,
  fixedStoreId,
  stores = [],
  backHref,
  backLabel,
}: CouponFormProps) {
  const [code, setCode] = useState(initial?.code ?? '');
  const [type, setType] = useState<'PERCENT' | 'FIXED'>(initial?.type ?? 'PERCENT');
  const [discount, setDiscount] = useState(String(initial?.discount ?? ''));
  const [storeId, setStoreId] = useState<string | null>(initial?.storeId ?? fixedStoreId ?? null);
  const [usageLimit, setUsageLimit] = useState(initial?.usageLimit != null ? String(initial.usageLimit) : '');
  const [expiresAt, setExpiresAt] = useState(
    initial?.expiresAt ? new Date(initial.expiresAt).toISOString().slice(0, 16) : ''
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const discountNum = parseFloat(discount);
    if (Number.isNaN(discountNum) || discountNum <= 0) {
      toast({ title: 'Enter a valid discount', variant: 'error' });
      return;
    }
    if (type === 'PERCENT' && discountNum > 100) {
      toast({ title: 'Percent discount cannot exceed 100', variant: 'error' });
      return;
    }
    setLoading(true);
    const data: CouponFormData = {
      code,
      type,
      discount: discountNum,
      storeId: fixedStoreId !== undefined ? fixedStoreId : storeId || null,
      usageLimit: usageLimit.trim() ? Math.max(0, parseInt(usageLimit, 10) || 0) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      isActive,
    };
    if (couponId) {
      const res = await updateCoupon(couponId, data);
      if (res?.error) toast({ title: res.error, variant: 'error' });
      else {
        toast({ title: 'Coupon updated', variant: 'success' });
        router.refresh();
      }
    } else {
      const res = await createCoupon(data);
      if (res?.error) toast({ title: res.error, variant: 'error' });
      else {
        toast({ title: 'Coupon created', variant: 'success' });
        router.push(backHref);
      }
    }
    setLoading(false);
  };

  const inputClass =
    'w-full rounded-xl border px-4 py-3 font-sans text-[14px] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-0 focus:border-[var(--gold)]';
  const inputStyle = {
    background: 'var(--surface2)',
    borderColor: 'var(--line)',
    color: 'var(--text)',
  };
  const labelClass = 'font-sans text-[13px] font-medium block mb-2';
  const labelStyle = { color: 'var(--text-2)' };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        {/* Section: Discount details */}
        <div className="p-6 lg:p-8 border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}
            >
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="font-display text-[18px] font-semibold" style={{ color: 'var(--text)' }}>
              Discount details
            </h3>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="code" className={labelClass} style={labelStyle}>
                Coupon code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                required
                className={`${inputClass} font-mono uppercase`}
                style={inputStyle}
              />
              <p className="font-sans text-[12px] mt-1.5" style={{ color: 'var(--text-4)' }}>
                Customers enter this at checkout. Stored in uppercase.
              </p>
            </div>

            <div>
              <span className={labelClass} style={labelStyle}>
                Discount type
              </span>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setType('PERCENT')}
                  className="flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all cursor-pointer"
                  style={{
                    borderColor: type === 'PERCENT' ? 'var(--line-gold)' : 'var(--line)',
                    background: type === 'PERCENT' ? 'var(--gold-bg)' : 'var(--surface2)',
                    boxShadow: type === 'PERCENT' ? '0 0 0 1px rgba(212,168,67,0.15)' : 'none',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: type === 'PERCENT' ? 'rgba(212,168,67,0.2)' : 'var(--surface3)',
                      color: type === 'PERCENT' ? 'var(--gold)' : 'var(--text-3)',
                    }}
                  >
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>Percent</p>
                    <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>e.g. 20% off</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setType('FIXED')}
                  className="flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all cursor-pointer"
                  style={{
                    borderColor: type === 'FIXED' ? 'var(--line-gold)' : 'var(--line)',
                    background: type === 'FIXED' ? 'var(--gold-bg)' : 'var(--surface2)',
                    boxShadow: type === 'FIXED' ? '0 0 0 1px rgba(212,168,67,0.15)' : 'none',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: type === 'FIXED' ? 'rgba(212,168,67,0.2)' : 'var(--surface3)',
                      color: type === 'FIXED' ? 'var(--gold)' : 'var(--text-3)',
                    }}
                  >
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-semibold" style={{ color: 'var(--text)' }}>Fixed amount</p>
                    <p className="font-sans text-[12px] mt-0.5" style={{ color: 'var(--text-4)' }}>e.g. $10 off</p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="discount" className={labelClass} style={labelStyle}>
                {type === 'PERCENT' ? 'Discount (%)' : 'Discount amount'}
              </label>
              <div className="relative">
                {type === 'FIXED' && (
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-[14px] font-medium"
                    style={{ color: 'var(--text-4)' }}
                  >
                    $
                  </span>
                )}
                <input
                  id="discount"
                  type="number"
                  min={0}
                  max={type === 'PERCENT' ? 100 : undefined}
                  step={type === 'PERCENT' ? 1 : 0.01}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  required
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    paddingLeft: type === 'FIXED' ? '2rem' : undefined,
                  }}
                />
                {type === 'PERCENT' && (
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 font-sans text-[14px] font-medium"
                    style={{ color: 'var(--text-4)' }}
                  >
                    %
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Scope (admin only) */}
        {stores.length > 0 && (
          <div className="p-6 lg:p-8 border-b" style={{ borderColor: 'var(--line)' }}>
            <h3 className="font-display text-[16px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Scope
            </h3>
            <div>
              <label htmlFor="storeId" className={labelClass} style={labelStyle}>
                Store (optional)
              </label>
              <select
                id="storeId"
                value={storeId ?? ''}
                onChange={(e) => setStoreId(e.target.value || null)}
                className={inputClass}
                style={inputStyle}
              >
                <option value="">Platform — all stores</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Section: Limits & expiry */}
        <div className="p-6 lg:p-8 border-b" style={{ borderColor: 'var(--line)' }}>
          <h3 className="font-display text-[16px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Limits & expiry
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="usageLimit" className={labelClass} style={labelStyle}>
                Usage limit
              </label>
              <input
                id="usageLimit"
                type="number"
                min={0}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="expiresAt" className={labelClass} style={labelStyle}>
                Expires at
              </label>
              <input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section: Status — clear On / Off */}
        <div className="p-6 lg:p-8">
          <h3 className="font-display text-[16px] font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Status
          </h3>
          <div className="flex items-center gap-3">
            <span className="font-sans text-[13px] font-medium" style={{ color: 'var(--text-3)' }}>Coupon is</span>
            <div className="inline-flex rounded-lg border p-0.5" style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                className="rounded-md px-4 py-2 font-sans text-[13px] font-medium transition-colors"
                style={{
                  background: !isActive ? 'var(--surface3)' : 'transparent',
                  color: !isActive ? 'var(--text)' : 'var(--text-4)',
                }}
              >
                Off
              </button>
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className="rounded-md px-4 py-2 font-sans text-[13px] font-medium transition-colors"
                style={{
                  background: isActive ? 'var(--gold)' : 'transparent',
                  color: isActive ? '#0D0D0F' : 'var(--text-4)',
                }}
              >
                On
              </button>
            </div>
            <span className="font-sans text-[12px]" style={{ color: 'var(--text-4)' }}>
              {isActive ? 'Coupon can be used at checkout' : 'Coupon is disabled'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex flex-wrap items-center gap-3 p-6 lg:p-8 border-t"
          style={{ borderColor: 'var(--line)', background: 'var(--surface2)' }}
        >
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl px-6 py-3 font-sans text-[14px] font-semibold border-0 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              background: 'var(--gold)',
              color: '#0a0a0a',
            }}
          >
            {loading ? 'Saving…' : couponId ? 'Update coupon' : 'Create coupon'}
          </button>
          <Link
            href={backHref}
            className="rounded-xl px-6 py-3 font-sans text-[14px] font-medium border no-underline transition-colors hover:opacity-90"
            style={{
              borderColor: 'var(--line)',
              color: 'var(--text-2)',
              background: 'transparent',
            }}
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
