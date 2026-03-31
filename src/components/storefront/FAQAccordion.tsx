'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'How can I place an order?',
    a: 'Browse our store, add items to your cart, and proceed to checkout. Follow the prompts to enter your shipping and payment details.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit/debit cards, UPI, and secure online payments powered by Stripe.',
  },
  {
    q: 'Can I cancel or modify my order after placing it?',
    a: 'Orders can be modified or cancelled within 24 hours of placement. Contact our support team immediately at +91 8828381778.',
  },
  {
    q: 'How long will it take for my order to arrive?',
    a: 'Standard delivery takes 5–7 business days. Express options are available at checkout.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer hassle-free returns within 30 days of delivery. Items must be unused and in original packaging.',
  },
  {
    q: 'Do you offer international shipping?',
    a: 'Yes, we ship worldwide. International delivery takes 10–14 business days depending on location.',
  },
  {
    q: 'How can I contact your customer care team?',
    a: 'Call us at +91 8828381778 or use the live chat on our website. Available Monday to Sunday, 9am to 9pm PT.',
  },
  {
    q: 'Do you have a loyalty or rewards program?',
    a: 'Yes! Sign up for an account and earn points on every purchase. Redeem points for exclusive discounts and early access to sales.',
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      data-reveal
      data-reveal-stagger="1"
      className="py-[100px] px-6 md:px-10 lg:px-12 bg-[var(--bg)] border-t"
      style={{ borderColor: 'rgba(29,110,255,0.15)' }}
    >
      <div data-reveal-child className="max-w-[860px] mx-auto text-center mb-12">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)] inline-flex items-center gap-3 justify-center">
          <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
          FAQ
        </p>
        <h2 className="mt-3 font-display font-extrabold leading-[1.05]" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', letterSpacing: '-1.6px' }}>
          Frequently Asked <span className="insync-gradient-text italic">Questions</span>
        </h2>
        <p className="mt-4">
          <span className="font-sans text-[13px]" style={{ color: 'var(--muted)' }}>
            Can&apos;t find an answer?{' '}
          </span>
          <Link
            href="#"
            data-cursor="interactive"
            className="inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--cyan)' }}
          >
            Contact Us <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>

      <div data-reveal-child className="flex flex-col max-w-[860px] mx-auto">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="mb-[10px] overflow-hidden"
              style={{
                background: 'rgba(6,18,50,0.7)',
                border: '1px solid rgba(29,110,255,0.15)',
                borderRadius: 12,
                backdropFilter: 'blur(20px)',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                data-cursor="interactive"
                className="w-full flex items-center justify-between gap-6 py-5 px-6 text-left transition-all duration-200"
                style={{
                  borderLeft: isOpen ? '4px solid rgba(0,200,255,0.9)' : '4px solid transparent',
                }}
              >
                <span
                  className="font-sans text-[15px] font-medium flex-1 leading-[1.35] transition-colors"
                  style={{ color: isOpen ? 'var(--white)' : 'rgba(238,242,255,0.82)' }}
                >
                  {item.q}
                </span>
                <span
                  className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-250"
                  style={{
                    borderColor: isOpen ? 'rgba(29,110,255,0.4)' : 'rgba(29,110,255,0.18)',
                    background: isOpen ? 'rgba(29,110,255,0.10)' : 'transparent',
                    color: 'var(--cyan)',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: isOpen ? 220 : 0,
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <p
                  className="font-sans text-[14px] leading-[1.8] pb-6 px-6"
                  style={{ color: 'var(--muted)' }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
