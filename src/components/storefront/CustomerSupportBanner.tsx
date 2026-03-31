import { Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function CustomerSupportBanner() {
  return (
    <section
      data-reveal
      data-reveal-stagger="1"
      className="py-[100px] px-6 md:px-10 lg:px-12 bg-[var(--bg)] border-t"
      style={{ borderColor: 'rgba(29,110,255,0.15)' }}
    >
      <div
        data-reveal-child
        className="max-w-6xl mx-auto rounded-[16px] border overflow-hidden"
        style={{
          background: 'rgba(6,18,50,0.7)',
          borderColor: 'rgba(29,110,255,0.15)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 44px rgba(29,110,255,0.12)',
        }}
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-0"
          style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr' }}
        >
          {/* Left */}
          <div className="p-10 max-lg:p-8">
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)] inline-flex items-center gap-3">
              <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
              Support
            </p>
            <h2 className="mt-4 font-display font-extrabold leading-[1.05]" style={{ fontSize: 'clamp(34px, 4.2vw, 52px)', letterSpacing: '-1.6px', color: 'var(--white)' }}>
              We&apos;re Always <span className="insync-gradient-text italic">Here For You</span>
            </h2>
            <p className="mt-5 font-sans text-[14px] leading-[1.9] max-w-[420px]" style={{ color: 'var(--muted)' }}>
              Available Monday to Sunday, 9am to 9pm PT for queries, order tracking, and product help.
            </p>
          </div>

          {/* Middle */}
          <div
            className="p-10 max-lg:p-8 border-x max-lg:border-x-0 max-lg:border-t"
            style={{ borderColor: 'rgba(29,110,255,0.15)' }}
          >
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] mb-2" style={{ color: 'rgba(238,242,255,0.65)' }}>
              Call us
            </p>
            <div className="font-display font-black insync-gradient-text" style={{ fontSize: 28, letterSpacing: '-0.8px' }}>
              +91 8828381778
            </div>
            <p className="mt-3 font-sans text-[13px] leading-[1.8]" style={{ color: 'var(--muted)' }}>
              For orders, returns, and product help.
            </p>

            <div className="mt-8 h-px" style={{ background: 'rgba(29,110,255,0.15)' }} />

            <div className="mt-8">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] mb-2" style={{ color: 'rgba(238,242,255,0.65)' }}>
                Live chat
              </p>
              <p className="font-display text-[20px] font-extrabold" style={{ color: 'var(--white)', letterSpacing: '-0.6px' }}>
                Chat with us now
              </p>
              <button type="button" data-cursor="interactive" className="btn btn-primary btn-sm mt-4">
                Start Chat
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="relative p-10 max-lg:p-8 overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 30% 30%, rgba(29,110,255,0.18), transparent 60%)' }}
            />
            <p
              className="absolute inset-0 flex items-center justify-center font-display text-[110px] font-black select-none pointer-events-none"
              style={{
                WebkitTextStroke: '1px rgba(29,110,255,0.12)',
                color: 'transparent',
                letterSpacing: '0.1em',
              }}
            >
              MUM
            </p>
            <div className="relative z-[1]">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'rgba(238,242,255,0.65)' }}>
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
    </section>
  );
}
