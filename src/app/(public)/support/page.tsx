import Link from 'next/link';
import type { Metadata } from 'next';
import { SupportContactPanel } from '@/components/storefront/SupportContactPanel';

export const metadata: Metadata = {
  title: 'Support | InsyncX',
  description:
    'Contact InsyncX for orders, returns, and product help. Phone +91 8828381778. Monday–Sunday, 9am–9pm PT.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div
        className="border-b py-10 px-6 md:px-12 lg:py-12"
        style={{ borderColor: 'rgba(29,110,255,0.15)', background: 'var(--surface)' }}
      >
        <div className="max-w-[var(--content-max)] mx-auto flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] mb-2 inline-flex items-center gap-3"
              style={{ color: 'var(--cyan)' }}
            >
              <span className="inline-block h-px w-7" style={{ background: 'rgba(0,200,255,0.7)' }} />
              Help center
            </p>
            <h1 className="font-display text-[clamp(32px,5vw,48px)] font-extrabold tracking-[-0.04em] text-[var(--white)]">
              <span className="insync-gradient-text italic">Support</span>
            </h1>
            <p className="font-sans text-[14px] leading-[1.7] mt-4 max-w-[560px]" style={{ color: 'var(--muted)' }}>
              We&apos;re here Monday–Sunday, 9am–9pm PT—call, chat, or read answers on our{' '}
              <Link href="/about#faq" className="text-[var(--cyan)] hover:underline">
                FAQ
              </Link>
              .
            </p>
          </div>
          <Link
            href="/"
            data-cursor="interactive"
            className="font-sans text-[13px] font-medium shrink-0 transition-colors hover:text-[var(--cyan)]"
            style={{ color: 'var(--muted)' }}
          >
            ← Back to home
          </Link>
        </div>
      </div>

      <div className="max-w-[var(--content-max)] mx-auto px-6 py-14 md:px-10 md:py-16 lg:px-12 lg:py-20">
        <SupportContactPanel />
      </div>
    </div>
  );
}
