'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@prisma/client';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SectionReveal } from '@/components/motion/SectionReveal';
import { RevealItem } from '@/components/motion/RevealItem';

const CATEGORY_GRADIENTS: Record<string, string> = {
  men: 'linear-gradient(145deg, #0f0f1a 0%, #1a1a3a 100%)',
  women: 'linear-gradient(145deg, #1a0f0f 0%, #3a1a1a 100%)',
  lgbtq: 'linear-gradient(145deg, #0f0f1a 0%, #2a1a3a 100%)',
  lgbtqplus: 'linear-gradient(145deg, #0f0f1a 0%, #2a1a3a 100%)',
  wellness: 'linear-gradient(145deg, #0f1a0f 0%, #1a3a1a 100%)',
  yoga: 'linear-gradient(145deg, #0f1a12 0%, #1a2e22 100%)',
  party: 'linear-gradient(145deg, #1a1a0f 0%, #3a3a0f 100%)',
  exotic: 'linear-gradient(145deg, #1a0f0a 0%, #3a1f0f 100%)',
  'sale-offers': 'linear-gradient(145deg, #1a1515 0%, #2a1010 100%)',
  athleisure: 'linear-gradient(145deg, #0f1418 0%, #1a2838 100%)',
  beauty: 'linear-gradient(145deg, #1a0f18 0%, #2a1530 100%)',
};

const NOISE_SVG =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E";

function getGradient(slug: string): string {
  return CATEGORY_GRADIENTS[slug] ?? 'linear-gradient(145deg, #111 0%, #1a1a1a 100%)';
}

interface CategoryGridProps {
  categories: (Category & { children?: Category[] })[];
}

/** 8 tiles on lg: hero 2×2, top-right pair, wide middle-right, full row of 4 on bottom */
const BENTO_LAYOUT = [
  'col-span-2 row-span-2 min-h-[280px] md:min-h-0 lg:col-start-1 lg:row-start-1',
  'col-span-1 min-h-[140px] lg:col-start-3 lg:row-start-1',
  'col-span-1 min-h-[140px] lg:col-start-4 lg:row-start-1',
  'col-span-2 min-h-[160px] lg:col-start-3 lg:row-start-2',
  'col-span-1 min-h-[140px] lg:col-start-1 lg:row-start-3',
  'col-span-1 min-h-[140px] lg:col-start-2 lg:row-start-3',
  'col-span-1 min-h-[140px] lg:col-start-3 lg:row-start-3',
  'col-span-1 min-h-[140px] lg:col-start-4 lg:row-start-3',
] as const;

function BentoCategoryCard({
  cat,
  layoutClass,
}: {
  cat: Category;
  layoutClass: string;
}) {
  return (
    <div
      className={cn(
        'group relative h-full min-h-0 rounded-2xl p-px transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:shadow-[0_0_40px_rgba(29,110,255,0.18)]',
        layoutClass,
      )}
      onPointerMove={(e) => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        (e.currentTarget as HTMLDivElement).style.setProperty('--mx', `${e.clientX - r.left}px`);
        (e.currentTarget as HTMLDivElement).style.setProperty('--my', `${e.clientY - r.top}px`);
      }}
      onPointerLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
      }}
      style={{
        background:
          'radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), rgba(0,200,255,0.45), rgba(29,110,255,0.2) 38%, rgba(255,255,255,0.06) 52%, transparent 62%)',
      }}
    >
      <Link
        href={`/shop?category=${encodeURIComponent(cat.slug)}`}
        data-cursor="interactive"
        className="insync-storefront-glass relative flex h-full min-h-[inherit] flex-col overflow-hidden rounded-[13px]"
      >
        <div
          data-glow-follow
          className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(29,110,255,0.2), transparent 55%)',
          }}
        />

        {cat.image ? (
          <Image
            src={cat.image}
            alt=""
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
            sizes="(max-width: 1024px) 100vw, 28vw"
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            style={{ background: getGradient(cat.slug) }}
          />
        )}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("${NOISE_SVG}")` }} />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(to top, rgba(2,10,24,0.92), rgba(2,10,24,0.12) 55%, transparent 100%)',
          }}
        />

        <div className="relative z-[3] mt-auto p-5 md:p-6">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(238,242,255,0.88)] backdrop-blur-md"
          >
            Category
          </span>
          <p className="mt-3 font-display text-xl font-extrabold tracking-[-0.04em] text-[var(--white)] md:text-2xl">
            {cat.name}
          </p>
          <p className="mt-1 font-sans text-[13px] text-[var(--muted)]">Explore products</p>
        </div>

        <div
          className="absolute right-4 top-4 z-[3] flex h-8 w-8 translate-y-[-4px] items-center justify-center rounded-full border border-white/10 bg-[rgba(255,255,255,0.05)] opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ArrowUpRight className="h-3.5 w-3.5 text-[rgba(238,242,255,0.85)]" />
        </div>
      </Link>
    </div>
  );
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const flatList = categories.flatMap((c) => [c, ...(c.children ?? [])]);
  const list = useMemo(
    () => [...flatList].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8),
    [flatList],
  );

  if (list.length === 0) return null;

  return (
    <SectionReveal
      stagger
      className="bg-[var(--bg)] px-6 pb-12 pt-[100px] md:px-10 md:pb-14 lg:px-12 lg:pb-16"
    >
      <RevealItem className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)]">
            <span className="inline-block h-px w-7" style={{ background: 'rgba(0,200,255,0.7)' }} />
            Browse by
          </p>
          <h2
            className="mt-3 font-display font-extrabold leading-[1.05]"
            style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', letterSpacing: '-1.6px' }}
          >
            Shop by <span className="insync-gradient-text italic">Category</span>
          </h2>
        </div>
        <Link
          href="/shop"
          data-cursor="interactive"
          className="inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition-colors duration-200 hover:text-[var(--white)]"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </RevealItem>

      <RevealItem>
        <div
          className={cn(
            'grid grid-cols-2 gap-3 md:gap-4',
            'lg:grid-cols-4 lg:grid-rows-[minmax(160px,1fr)_minmax(160px,1fr)_minmax(140px,auto)]',
          )}
        >
          {list.map((cat, i) => (
            <BentoCategoryCard key={cat.id} cat={cat} layoutClass={BENTO_LAYOUT[i] ?? 'col-span-1 min-h-[140px]'} />
          ))}
        </div>
      </RevealItem>
    </SectionReveal>
  );
}
