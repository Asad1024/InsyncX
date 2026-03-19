'use client';

import { useDisplaySettings } from '@/context/display-settings';
import { formatPrice } from '@/lib/utils';

interface MarqueeProps {
  items: string[];
}

function MarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const duplicated = [...items, ...items];
  return (
    <div
      className="flex items-center w-max shrink-0"
      style={{
        animation: reverse ? 'marqueeRight 45s linear infinite' : 'marqueeLeft 45s linear infinite',
      }}
    >
      {duplicated.map((item, i) => (
        <span key={`${item}-${i}`} className="inline-flex items-center font-sans text-[15px] font-normal tracking-[0.08em] text-[var(--text-2)] whitespace-nowrap py-0">
          {item}
          <span className="mx-6 text-[var(--text-4)] text-[9px]">•</span>
        </span>
      ))}
    </div>
  );
}

const STATIC_BANNER_ITEMS = ['INSYNCX143 — 20% off', 'New arrivals', 'Easy returns'];

export function Marquee({ items }: MarqueeProps) {
  const displaySettings = useDisplaySettings();
  const freeShipItem =
    displaySettings.freeShippingThreshold != null
      ? `Free shipping on orders over ${formatPrice(displaySettings.freeShippingThreshold, displaySettings.currencySymbol)}`
      : null;
  const bannerItems = freeShipItem ? [freeShipItem, ...STATIC_BANNER_ITEMS] : STATIC_BANNER_ITEMS;
  const combined = [...(items.length ? items : ['Collections']), ...bannerItems];

  return (
    <section
      className="overflow-hidden border-t border-b flex flex-col"
      style={{
        borderColor: 'var(--line)',
        minHeight: 72,
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg) 50%, var(--surface) 100%)',
      }}
    >
      <div className="flex-1 w-full overflow-hidden flex items-center border-b border-[var(--line)]/50">
        <MarqueeRow items={combined} reverse={false} />
      </div>
      <div className="flex-1 w-full overflow-hidden flex items-center">
        <MarqueeRow items={combined} reverse />
      </div>
    </section>
  );
}
