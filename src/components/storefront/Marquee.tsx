'use client';

import { motion } from 'framer-motion';
import { useDisplaySettings } from '@/context/display-settings';
import { homeViewport, sectionRevealVariants } from '@/lib/motion';
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
        animation: reverse ? 'marqueeRight 28s linear infinite' : 'marqueeLeft 28s linear infinite',
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
    <motion.section
      className="flex overflow-hidden py-4 md:py-5"
      style={{
        minHeight: 56,
        background: 'linear-gradient(90deg, var(--blue-mid), var(--blue))',
      }}
      initial="hidden"
      whileInView="visible"
      viewport={homeViewport}
      variants={sectionRevealVariants}
    >
      <div className="flex w-full min-h-[44px] items-center overflow-hidden">
        <MarqueeRow items={combined} reverse={false} />
      </div>
    </motion.section>
  );
}
