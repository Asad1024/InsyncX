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
        animation: reverse ? 'marqueeRight 24s linear infinite' : 'marqueeLeft 24s linear infinite',
      }}
    >
      {duplicated.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="inline-flex items-center font-sans text-[12px] font-semibold tracking-[0.2em] text-white/80 whitespace-nowrap py-0 uppercase"
        >
          {item}
          <span className="mx-8 text-white/30 text-[14px] leading-none">·</span>
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
  const combined = [...(items.length ? items : ['Collections']), ...bannerItems].map((s) => s.toUpperCase());

  return (
    <section
      data-reveal
      className="overflow-hidden flex flex-col"
      style={{
        minHeight: 72,
        background: 'linear-gradient(90deg, var(--blue-mid), var(--blue))',
      }}
    >
      <div className="flex-1 w-full overflow-hidden flex items-center border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.14)' }}>
        <MarqueeRow items={combined} reverse={false} />
      </div>
      <div className="flex-1 w-full overflow-hidden flex items-center">
        <MarqueeRow items={combined} reverse />
      </div>
    </section>
  );
}
