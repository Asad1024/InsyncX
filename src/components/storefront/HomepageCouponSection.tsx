'use client';

import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Check, Tag, Percent, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useDisplaySettings } from '@/context/display-settings';
import { formatPrice } from '@/lib/utils';
import type { HomepageFeaturedCoupon } from '@/actions/coupon.actions';

function discountLabel(coupon: HomepageFeaturedCoupon, currencySymbol: string): string {
  if (coupon.type === 'PERCENT') return `${coupon.discount}% off`;
  return `${formatPrice(coupon.discount, currencySymbol)} off`;
}

function formatExpiry(expiresAt: Date | null): string {
  if (!expiresAt) return 'No expiry';
  const d = new Date(expiresAt);
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export function HomepageCouponSection({ coupons }: { coupons: HomepageFeaturedCoupon[] }) {
  const { toast } = useToast();
  const { currencySymbol } = useDisplaySettings();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (coupons.length === 0) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast({ title: 'Copied!', variant: 'success' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section
      className="border-t border-b py-16 px-6 md:px-12"
      style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Sales / off messaging */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}
              >
                <Percent className="w-5 h-5" />
              </div>
              <Sparkles className="w-5 h-5 text-[var(--gold)]" />
            </div>
            <h2 className="font-display font-light text-[var(--text)] leading-tight tracking-[-0.02em]" style={{ fontSize: 'clamp(28px, 4vw, 36px)' }}>
              Sales &amp; offers
            </h2>
            <p className="font-sans text-[15px] mt-3" style={{ color: 'var(--text-3)' }}>
              Use these promo codes at checkout to save. Each code is valid for the store or platform shown.
            </p>
            <Link href="/shop" className="btn btn-primary mt-6 inline-flex">
              Shop now
            </Link>
          </div>

          {/* Right: Coupon cards */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-4 h-4 text-[var(--gold)]" />
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--text-4)' }}>
                Promo codes
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="rounded-[14px] border py-5 px-5 flex flex-col"
                  style={{
                    borderColor: 'var(--line)',
                    background: 'var(--surface2)',
                  }}
                >
                  <p className="font-sans text-[12px] font-semibold text-[var(--gold)] mb-1">
                    {discountLabel(coupon, currencySymbol)}
                  </p>
                  <p className="font-display font-normal text-[var(--text)] text-[22px] tracking-[0.06em] mb-3">
                    {coupon.code}
                  </p>
                  <div className="font-sans text-[12px] space-y-1 mb-4" style={{ color: 'var(--text-3)' }}>
                    <p>
                      <span className="text-[var(--text-4)]">Expires:</span>{' '}
                      {formatExpiry(coupon.expiresAt)}
                    </p>
                    <p>
                      <span className="text-[var(--text-4)]">Valid at:</span>{' '}
                      {coupon.storeName ? (
                        <Link
                          href={coupon.storeSlug ? `/store/${coupon.storeSlug}` : '/shop'}
                          className="text-[var(--gold)] hover:underline"
                        >
                          {coupon.storeName}
                        </Link>
                      ) : (
                        'All stores'
                      )}
                    </p>
                    {coupon.usesLeft != null && (
                      <p>
                        {coupon.usesLeft} use{coupon.usesLeft !== 1 ? 's' : ''} left
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code, coupon.id)}
                    className="btn btn-primary btn-sm mt-auto w-fit"
                  >
                    {copiedId === coupon.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      'Copy code'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
