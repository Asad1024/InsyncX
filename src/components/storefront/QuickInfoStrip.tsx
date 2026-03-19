import { Truck, RotateCcw, Lock, Headphones } from 'lucide-react';

const ITEMS = [
  { icon: Truck, title: 'Free Shipping', sub: 'On orders over ₹999' },
  { icon: RotateCcw, title: 'Easy Returns', sub: '30-day hassle-free returns' },
  { icon: Lock, title: 'Secure Payment', sub: 'Powered by Stripe' },
  { icon: Headphones, title: '24/7 Support', sub: 'Mon–Sun, 9am–9pm PT' },
];

export function QuickInfoStrip() {
  return (
    <section
      className="border-t border-b bg-[var(--surface)] py-10 px-12"
      style={{ borderColor: 'var(--line)' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, sub }, i) => (
          <div
            key={title}
            className="text-center py-0 px-8 border-r border-b lg:border-b-0 border-[var(--line)] last:border-r-0 last:border-b-0"
          >
            <div
              className="w-12 h-12 rounded-full border flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'var(--gold-bg)',
                borderColor: 'var(--line-gold)',
              }}
            >
              <Icon className="w-6 h-6 text-[var(--gold)]" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-[20px] font-normal text-[var(--text)] mb-1.5">
              {title}
            </h3>
            <p className="font-sans text-[12px] text-[var(--text-3)] leading-[1.5]">
              {sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
