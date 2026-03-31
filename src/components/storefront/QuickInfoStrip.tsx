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
      data-reveal
      className="border-t border-b py-10 px-6 md:px-10 lg:px-12"
      style={{
        borderColor: 'rgba(29,110,255,0.15)',
        background: 'rgba(6,18,50,0.5)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div data-reveal-child className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-[var(--content-max)] mx-auto">
        {ITEMS.map(({ icon: Icon, title, sub }, i) => (
          <div
            key={title}
            className="group text-center py-8 px-6 border-r border-b lg:border-b-0 last:border-r-0 last:border-b-0"
            style={{ borderColor: 'rgba(29,110,255,0.15)' }}
          >
            <div
              className="w-12 h-12 rounded-full border flex items-center justify-center mx-auto mb-4 transition-shadow duration-200 group-hover:shadow-[0_0_28px_rgba(29,110,255,0.35)]"
              style={{
                background: 'rgba(29,110,255,0.10)',
                borderColor: 'rgba(29,110,255,0.2)',
              }}
            >
              <Icon className="w-6 h-6" style={{ color: 'var(--cyan)' }} strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-[13px] font-semibold mb-1.5" style={{ color: 'var(--white)', letterSpacing: '-0.4px' }}>
              {title}
            </h3>
            <p className="font-sans text-[11px] leading-[1.6]" style={{ color: 'var(--muted)' }}>
              {sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
