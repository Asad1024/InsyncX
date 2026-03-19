import { Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function CustomerSupportBanner() {
  return (
    <section
      className="py-20 px-12 bg-[var(--surface)] border-t"
      style={{ borderColor: 'var(--line)' }}
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-16 max-w-6xl mx-auto lg:[grid-template-columns:1.2fr_1fr_0.8fr]"
      >
        <div>
          <p className="section-label">Support</p>
          <h2 className="font-display font-light text-[var(--text)] leading-[1.1] text-[52px] mt-0">
            We&apos;re Always
          </h2>
          <h2 className="font-display font-light italic text-[var(--gold)] leading-[1.1] text-[52px] mt-0">
            Here For You
          </h2>
          <p className="font-sans text-[14px] text-[var(--text-3)] leading-[1.8] max-w-[360px] mt-5">
            Available Monday to Sunday, 9am to 9pm PT for queries, order tracking, and product help.
          </p>
        </div>

        <div
          className="flex flex-col gap-8 border-x py-0 px-12 max-lg:border-x-0 max-lg:border-t max-lg:pt-8 max-lg:mt-0"
          style={{ borderColor: 'var(--line)' }}
        >
          <div>
            <Phone className="w-5 h-5 text-[var(--gold)] mb-3" strokeWidth={1.5} />
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-3)] mb-3">
              Call Us
            </p>
            <p className="font-display text-[28px] font-normal text-[var(--text)]">
              +91 8828381778
            </p>
            <p className="font-sans text-[12px] text-[var(--text-3)] mt-1">
              Mon–Sun, 9am–9pm PT
            </p>
          </div>
          <div className="h-px bg-[var(--line)]" />
          <div>
            <MessageCircle className="w-5 h-5 text-[var(--gold)] mb-3" strokeWidth={1.5} />
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-3)] mb-3">
              Live Chat
            </p>
            <p className="font-display text-[22px] font-normal text-[var(--text)]">
              Chat with us now
            </p>
            <button type="button" className="btn btn-ghost btn-sm mt-3">
              Start Chat
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <p
            className="absolute inset-0 flex items-center justify-center font-display text-[100px] font-light select-none pointer-events-none"
            style={{ color: 'rgba(212,168,67,0.04)', letterSpacing: '0.1em' }}
          >
            MUM
          </p>
          <div className="relative z-[1]">
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-3)] mb-1">
              Location
            </p>
            <p className="font-display text-[48px] font-light text-[var(--text)]">
              Mumbai
            </p>
            <p className="font-sans text-[13px] text-[var(--text-3)] mt-1">
              +91 8828381778
            </p>
            <p className="font-sans text-[12px] text-[var(--text-4)] mt-1">
              Maharashtra, India
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
