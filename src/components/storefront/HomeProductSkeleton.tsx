'use client';

import { SectionReveal } from '@/components/motion/SectionReveal';
import { RevealItem } from '@/components/motion/RevealItem';

const glass = 'insync-storefront-glass rounded-2xl overflow-hidden relative';

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 -translate-x-full animate-[homeSkelShimmer_2.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent ${className ?? ''}`}
      aria-hidden
    />
  );
}

export function NewArrivalsSkeleton() {
  return (
    <SectionReveal
      stagger
      className="scroll-mt-[var(--nav-h)] bg-[var(--bg)] px-6 pb-12 pt-8 md:px-10 md:pb-14 md:pt-10 lg:px-12 lg:pb-16 lg:pt-12"
    >
      <RevealItem className="mb-10 flex items-end justify-between">
        <div className="space-y-3">
          <div className={`h-3 w-32 ${glass}`}>
            <Shimmer />
          </div>
          <div className={`h-12 w-[min(100%,320px)] ${glass}`}>
            <Shimmer />
          </div>
        </div>
        <div className={`h-9 w-28 rounded-full ${glass}`}>
          <Shimmer />
        </div>
      </RevealItem>
      <RevealItem className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-10 w-24 rounded-full ${glass}`}>
            <Shimmer />
          </div>
        ))}
      </RevealItem>
      <RevealItem className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`aspect-[5/6] ${glass}`}>
            <Shimmer />
          </div>
        ))}
      </RevealItem>
    </SectionReveal>
  );
}

export function LatestFromStoresSkeleton() {
  return (
    <SectionReveal
      stagger
      className="bg-[var(--bg)] px-6 pb-10 pt-8 md:px-10 md:pb-12 md:pt-10 lg:px-12 lg:pb-14 lg:pt-12"
    >
      <RevealItem className="mx-auto mb-10 max-w-[1400px]">
        <div className="mb-3 flex gap-3">
          <div className={`h-px w-7 self-center ${glass}`} />
          <div className={`h-3 w-40 ${glass}`}>
            <Shimmer />
          </div>
        </div>
        <div className={`h-14 w-[min(100%,420px)] ${glass}`}>
          <Shimmer />
        </div>
      </RevealItem>
      <RevealItem className="mx-auto grid max-w-[1400px] grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={`min-h-[200px] ${glass} ${i === 0 ? 'md:col-span-2 md:row-span-2 md:min-h-[420px]' : ''}`}>
            <Shimmer />
          </div>
        ))}
      </RevealItem>
    </SectionReveal>
  );
}

export function OfficialPicksSkeleton() {
  return (
    <SectionReveal
      stagger
      className="relative overflow-hidden border-t px-6 pb-14 pt-12 md:px-10 md:pb-16 md:pt-14 lg:px-12 lg:pb-20 lg:pt-16"
      style={{
        borderColor: 'rgba(29,110,255,0.15)',
        background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg2) 45%, var(--bg) 100%)',
      }}
    >
      <RevealItem className="relative z-[2] mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className={`h-3 w-28 ${glass}`}>
            <Shimmer />
          </div>
          <div className={`h-11 w-[min(100%,280px)] ${glass}`}>
            <Shimmer />
          </div>
        </div>
        <div className={`h-10 w-40 rounded-full ${glass}`}>
          <Shimmer />
        </div>
      </RevealItem>
      <RevealItem className="relative z-[2] grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-[380px] ${glass}`}>
            <Shimmer />
          </div>
        ))}
      </RevealItem>
    </SectionReveal>
  );
}
