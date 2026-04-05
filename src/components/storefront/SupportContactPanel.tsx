import Link from 'next/link';
import { MapPin, MessageCircle, Phone } from 'lucide-react';

/**
 * Shared support contact layout — homepage banner and /support page.
 */
export function SupportContactPanel({ className = '' }: { className?: string }) {
  return (
    <div
      className={`mx-auto max-w-6xl overflow-hidden rounded-[16px] border ${className}`}
      style={{
        background: 'rgba(6,18,50,0.7)',
        borderColor: 'rgba(29,110,255,0.15)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 44px rgba(29,110,255,0.12)',
      }}
    >
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.2fr_1fr_0.8fr]">
        <div className="p-10 max-lg:p-8">
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)] inline-flex items-center gap-3">
            <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
            Support
          </p>
          <h2
            className="mt-4 font-display font-extrabold leading-[1.05]"
            style={{ fontSize: 'clamp(34px, 4.2vw, 52px)', letterSpacing: '-1.6px', color: 'var(--white)' }}
          >
            We&apos;re Always <span className="insync-gradient-text italic">Here For You</span>
          </h2>
          <p className="mt-5 font-sans text-[14px] leading-[1.9] max-w-[420px]" style={{ color: 'var(--muted)' }}>
            Available Monday to Sunday, 9am to 9pm PT for queries, order tracking, and product help.
          </p>
        </div>

        <div
          className="p-10 max-lg:p-8 border-x max-lg:border-x-0 max-lg:border-t"
          style={{ borderColor: 'rgba(29,110,255,0.15)' }}
        >
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] mb-2" style={{ color: 'rgba(238,242,255,0.65)' }}>
            Call us
          </p>
          <a
            href="tel:+918828381778"
            data-cursor="interactive"
            className="inline-flex items-center gap-2 font-display font-black insync-gradient-text transition-opacity hover:opacity-90"
            style={{ fontSize: 28, letterSpacing: '-0.8px' }}
          >
            <Phone className="h-6 w-6 shrink-0 text-[var(--cyan)]" strokeWidth={1.5} />
            +91 8828381778
          </a>
          <p className="mt-3 font-sans text-[13px] leading-[1.8]" style={{ color: 'var(--muted)' }}>
            For orders, returns, and product help.
          </p>

          <div className="mt-8 h-px" style={{ background: 'rgba(29,110,255,0.15)' }} />

          <div className="mt-8">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] mb-2" style={{ color: 'rgba(238,242,255,0.65)' }}>
              Live chat
            </p>
            <p className="flex items-center gap-2 font-display text-[20px] font-extrabold" style={{ color: 'var(--white)', letterSpacing: '-0.6px' }}>
              <MessageCircle className="h-5 w-5 text-[var(--cyan)]" strokeWidth={1.5} />
              Chat with us now
            </p>
            <button type="button" data-cursor="interactive" className="btn btn-primary btn-sm mt-4">
              Start Chat
            </button>
          </div>
        </div>

        <div className="relative p-10 max-lg:p-8 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(29,110,255,0.18), transparent 60%)' }}
          />
          <p
            className="absolute inset-0 flex items-center justify-center font-display text-[110px] font-black select-none pointer-events-none max-lg:text-[72px]"
            style={{
              WebkitTextStroke: '1px rgba(29,110,255,0.12)',
              color: 'transparent',
              letterSpacing: '0.1em',
            }}
          >
            MUM
          </p>
          <div className="relative z-[1]">
            <p className="flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'rgba(238,242,255,0.65)' }}>
              <MapPin className="h-3.5 w-3.5 text-[var(--cyan)]" strokeWidth={1.5} />
              Location
            </p>
            <p className="mt-2 font-display text-[44px] font-extrabold" style={{ color: 'var(--white)', letterSpacing: '-1px' }}>
              Mumbai
            </p>
            <p className="mt-2 font-sans text-[13px]" style={{ color: 'var(--muted)' }}>
              Mon–Sun, 9am–9pm PT
            </p>
            <Link href="#" data-cursor="interactive" className="inline-flex mt-6 btn btn-primary btn-sm">
              Chat with us now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
