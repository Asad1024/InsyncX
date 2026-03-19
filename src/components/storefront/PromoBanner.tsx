'use client';

import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

const CODE = 'INSYNCX143';

export function PromoBanner() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE);
    setCopied(true);
    toast({ title: 'Copied!', variant: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className="border-t border-b bg-[var(--surface)] py-16 px-12"
      style={{ borderColor: 'var(--line)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-6xl mx-auto">
        <div>
          <p className="section-label">Limited Time Offer</p>
          <h2 className="font-display font-light text-[var(--text)] leading-none tracking-[-0.02em] mt-0" style={{ fontSize: 72 }}>
            Save <span className="text-[var(--gold)]">20</span>%
          </h2>
          <p className="font-sans text-[15px] text-[var(--text-3)] mt-4">
            On your entire order. No minimum required.
          </p>
          <Link href="/shop" className="btn btn-primary mt-8">
            Shop the Sale
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <div
            className="relative rounded-[14px] border-2 border-dashed py-10 px-12 text-center"
            style={{
              borderColor: 'rgba(212,168,67,0.4)',
              background: 'var(--gold-bg)',
            }}
          >
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-3)] mb-3">
              Use code at checkout
            </p>
            <p className="font-display font-normal text-[var(--gold)] text-[52px] tracking-[0.08em]">
              {CODE}
            </p>
            <p className="font-sans text-[13px] text-[var(--text-3)] mt-2">
              Valid on all orders
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-primary btn-sm absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                'Copy Code'
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
