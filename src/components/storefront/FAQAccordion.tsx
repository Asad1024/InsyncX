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
    <section className="py-20 px-12 bg-[var(--bg)] border-t" style={{ borderColor: 'var(--line)' }}>
      <div className="max-w-[800px] mx-auto text-center mb-12">
        <p className="section-label">FAQ</p>
        <h2 className="section-title mt-0">
          Frequently Asked <em>Questions</em>
        </h2>
        <p className="mt-4">
          <span className="font-sans text-[13px] text-[var(--text-3)]">Can&apos;t find an answer? </span>
          <Link href="#" className="inline-flex items-center gap-1.5 font-sans text-[13px] text-[var(--gold)] hover:underline">
            Contact Us <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>

      <div className="flex flex-col max-w-[800px] mx-auto">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border-b"
              style={{ borderColor: 'var(--line)' }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-6 py-5 text-left transition-all duration-150"
              >
                <span
                  className={`font-display text-[20px] font-normal flex-1 leading-[1.3] transition-colors ${
                    isOpen ? 'text-[var(--text)]' : 'text-[var(--text-2)] hover:text-[var(--text)]'
                  }`}
                >
                  {item.q}
                </span>
                <span
                  className="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 font-sans text-[16px] transition-all duration-250"
                  style={{
                    borderColor: isOpen ? 'var(--line-gold)' : 'var(--line)',
                    background: isOpen ? 'var(--gold-bg)' : 'transparent',
                    color: isOpen ? 'var(--gold)' : 'var(--text-3)',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                  }}
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: isOpen ? 200 : 0,
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <p className="font-sans text-[14px] text-[var(--text-3)] leading-[1.7] max-w-[680px] pb-5">
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
