'use client';

import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Check, Tag, Percent, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useDisplaySettings } from '@/context/display-settings';
import { formatPrice } from '@/lib/utils';
import type { HomepageFeaturedCoupon } from '@/actions/coupon.actions';
import { SectionReveal } from '@/components/motion/SectionReveal';
import { RevealItem } from '@/components/motion/RevealItem';

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
    <SectionReveal
      stagger
      className="border-y px-6 py-[100px] md:px-10 lg:px-12"
      style={{ background: 'var(--bg)', borderColor: 'rgba(29,110,255,0.15)' }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Sales / off messaging */}
          <RevealItem className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(29,110,255,0.10)',
                  color: 'var(--cyan)',
                  border: '1px solid rgba(29,110,255,0.18)',
                  boxShadow: '0 0 24px rgba(29,110,255,0.18)',
                }}
              >
                <Percent className="w-5 h-5" />
              </div>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
            </div>
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)] inline-flex items-center gap-3">
              <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
              Offers
            </p>
            <h2 className="mt-3 font-display font-extrabold leading-[1.05]" style={{ fontSize: 'clamp(30px, 4vw, 44px)', letterSpacing: '-1.2px', color: 'var(--white)' }}>
              Sales &amp; <span className="insync-gradient-text italic">offers</span>
            </h2>
            <p className="font-sans text-[15px] mt-4 leading-[1.9]" style={{ color: 'var(--muted)' }}>
              Use these promo codes at checkout to save. Each code is valid for the store or platform shown.
            </p>
            <Link href="/shop" data-cursor="interactive" className="btn btn-primary mt-7 inline-flex">
              Shop now
            </Link>
          </RevealItem>

          {/* Right: Coupon cards */}
          <RevealItem className="lg:col-span-8">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'rgba(238,242,255,0.55)' }}>
                Promo codes
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="rounded-[16px] border py-6 px-6 flex flex-col relative overflow-hidden"
                  style={{
                    borderColor: 'rgba(29,110,255,0.15)',
                    background: 'rgba(6,18,50,0.7)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div
                    className="absolute -top-14 -right-14 w-[220px] h-[220px] rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(29,110,255,0.35), transparent 70%)',
                      filter: 'blur(26px)',
                    }}
                  />

                  <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] mb-2" style={{ color: 'var(--cyan)' }}>
                    {discountLabel(coupon, currencySymbol)}
                  </p>
                  <p className="font-display font-black text-[22px] tracking-[0.12em] mb-4" style={{ color: 'var(--white)' }}>
                    {coupon.code}
                  </p>
                  <div className="font-sans text-[12px] space-y-1 mb-5" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                    <p>
                      <span style={{ color: 'rgba(238,242,255,0.55)' }}>Expires:</span>{' '}
                      {formatExpiry(coupon.expiresAt)}
                    </p>
                    <p>
                      <span style={{ color: 'rgba(238,242,255,0.55)' }}>Valid at:</span>{' '}
                      {coupon.storeName ? (
                        <Link
                          href={coupon.storeSlug ? `/store/${coupon.storeSlug}` : '/shop'}
                          data-cursor="interactive"
                          className="hover:underline"
                          style={{ color: 'var(--cyan)' }}
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
                    data-cursor="interactive"
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
          </RevealItem>
        </div>
      </div>
    </SectionReveal>
  );
}
