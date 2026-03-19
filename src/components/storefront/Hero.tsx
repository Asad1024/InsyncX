'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useDisplaySettings } from '@/context/display-settings';
import { formatPrice } from '@/lib/utils';
import type { Product, Store, Category } from '@prisma/client';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

interface HeroProps {
  featuredProducts?: ProductWithRelations[];
}

// Hero-only images (ecomm/fashion — not used in product cards)
const HERO_ONLY_IMAGES = [
  'https://plus.unsplash.com/premium_photo-1664537981586-e550b3bd9872?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620226346750-3aea895ac33f?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589363460779-cd717d2ed8fa?w=1920&auto=format&fit=crop&q=80',
  'https://plus.unsplash.com/premium_photo-1708633003240-569a6135deaa?w=1920&auto=format&fit=crop&q=80',
  'https://plus.unsplash.com/premium_photo-1682435561654-20d84cef00eb?w=1920&auto=format&fit=crop&q=80',
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function Hero({ featuredProducts = [] }: HeroProps) {
  const displaySettings = useDisplaySettings();
  const images = useMemo(() => shuffle(HERO_ONLY_IMAGES), []);
  const [index, setIndex] = useState(0);
  const freeShippingText =
    displaySettings.freeShippingThreshold != null
      ? `Free shipping on orders over ${formatPrice(displaySettings.freeShippingThreshold, displaySettings.currencySymbol)}`
      : null;

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 3000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <section
      className="relative flex min-h-[calc(100vh-var(--nav-h))] w-full flex-col items-center justify-center overflow-hidden px-6 py-20 md:px-12 md:py-28"
      style={{ minHeight: 'calc(100vh - var(--nav-h))' }}
    >
      {/* Hero-only ecomm images (not used in product cards), change every 2s */}
      <div className="absolute inset-0 left-0 top-0 h-full w-full">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
            style={{
              opacity: i === index ? 1 : 0,
              zIndex: i === index ? 0 : -1,
            }}
            aria-hidden={i !== index}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
        <div
          className="absolute inset-0 left-0 top-0 z-[1] h-full w-full"
          style={{
            background: 'linear-gradient(180deg, rgba(9,9,11,0.7) 0%, rgba(9,9,11,0.45) 50%, rgba(9,9,11,0.8) 100%)',
          }}
        />
      </div>

      {/* Content — centered */}
      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        <span className="mb-4 inline-block font-sans text-[12px] font-medium uppercase tracking-[0.25em] text-[var(--gold)]">
          New Collection 2026
        </span>
        <h1 className="font-sans font-bold text-[var(--text)] leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}>
          INSYNC<span className="text-[var(--gold)]">X</span> <span className="text-[var(--gold)]">With You.</span>
        </h1>
        <p className="mt-4 font-sans text-[16px] text-[var(--text-2)] max-w-md leading-relaxed">
          Curated fashion for every identity. Discover pieces that move with you.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#fresh-arrivals"
            className="inline-flex items-center justify-center rounded-md border-2 border-[var(--gold)] bg-[var(--surface)]/80 px-6 py-3 font-sans text-[15px] font-medium tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]"
          >
            New arrivals
          </a>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-md bg-[var(--gold)] px-6 py-3 font-sans text-[15px] font-semibold tracking-wide text-[#080808] transition-opacity hover:opacity-90"
          >
            Discover
          </Link>
        </div>

        <p className="mt-8 font-sans text-[14px] font-normal text-white tracking-wide">
          {freeShippingText ? `${freeShippingText} · ` : ''}Easy returns · Secure checkout
        </p>
      </div>
    </section>
  );
}
