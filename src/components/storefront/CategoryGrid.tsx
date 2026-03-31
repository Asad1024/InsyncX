'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@prisma/client';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

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
};

const NOISE_SVG = "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E";

function getGradient(slug: string): string {
  return CATEGORY_GRADIENTS[slug] ?? 'linear-gradient(145deg, #111 0%, #1a1a1a 100%)';
}

interface CategoryGridProps {
  /** Flat list: root + child categories so e.g. Exotic (child of Men) appears */
  categories: (Category & { children?: Category[] })[];
}

function useTilt() {
  const cardsRef = useRef<Map<string, HTMLAnchorElement>>(new Map());

  useEffect(() => {
    const cards = Array.from(cardsRef.current.values());
    if (cards.length === 0) return;

    const onMove = (e: MouseEvent) => {
      const card = (e.currentTarget as HTMLAnchorElement) || null;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width;
      const cy = (e.clientY - rect.top) / rect.height;

      const ry = Math.max(-16, Math.min(16, (cx - 0.5) * 32));
      const rx = Math.max(-10, Math.min(10, (0.5 - cy) * 20));

      card.style.transform = `perspective(700px) rotateY(${ry}deg) rotateX(${rx}deg) scale(1.03)`;

      const glow = card.querySelector('[data-glow]') as HTMLDivElement | null;
      if (glow) {
        glow.style.opacity = '1';
        glow.style.left = `${cx * 100}%`;
        glow.style.top = `${cy * 100}%`;
      }
    };

    const onLeave = (e: MouseEvent) => {
      const card = (e.currentTarget as HTMLAnchorElement) || null;
      if (!card) return;
      card.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)';
      const glow = card.querySelector('[data-glow]') as HTMLDivElement | null;
      if (glow) glow.style.opacity = '0';
    };

    cards.forEach((c) => {
      c.style.transformStyle = 'preserve-3d';
      c.addEventListener('mousemove', onMove);
      c.addEventListener('mouseleave', onLeave);
    });

    return () => {
      cards.forEach((c) => {
        c.removeEventListener('mousemove', onMove);
        c.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return cardsRef;
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const flatList = categories.flatMap((c) => [c, ...(c.children ?? [])]);
  const list = [...flatList]
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 5); // keep existing data usage

  const ordered = useMemo(() => {
    const [a, b, c, d, e] = list;
    return { a, b, c, d, e };
  }, [list]);

  const cardsRef = useTilt();

  return (
    <section data-reveal className="py-[100px] px-6 md:px-10 lg:px-12 bg-[var(--bg)]">
      <div data-reveal-child className="flex items-end justify-between mb-10">
        <div>
          <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)] inline-flex items-center gap-3">
            <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
            Browse by
          </p>
          <h2 className="mt-3 font-display font-extrabold leading-[1.05]" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', letterSpacing: '-1.6px' }}>
            Shop by <span className="insync-gradient-text italic">Category</span>
          </h2>
        </div>
        <Link
          href="/shop"
          data-cursor="interactive"
          className="inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--white)] transition-colors duration-150"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div data-reveal-child className="grid gap-4 grid-cols-1 md:grid-cols-3 md:[grid-template-columns:2fr_1fr_1fr] md:[grid-template-rows:280px_200px]">
        {ordered.a && (
          <Link
            href={`/shop?category=${ordered.a.slug}`}
            ref={(el) => {
              if (!el) return;
              cardsRef.current.set(ordered.a.id, el);
            }}
            data-cursor="interactive"
            className="group relative overflow-hidden cursor-pointer transition-all duration-300"
            style={{
              gridRow: '1 / span 2',
              borderRadius: 14,
              border: '1px solid rgba(29,110,255,0.15)',
            }}
          >
            <div
              data-glow
              className="pointer-events-none absolute z-[2] w-[520px] h-[520px] rounded-full"
              style={{
                opacity: 0,
                transform: 'translate(-50%,-50%)',
                background: 'radial-gradient(circle, rgba(29,110,255,0.22), transparent 62%)',
                filter: 'blur(10px)',
                transition: 'opacity 0.2s ease',
              }}
            />

            {ordered.a.image ? (
              <Image
                src={ordered.a.image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.12] group-hover:rotate-[6deg]"
                sizes="(max-width: 1024px) 100vw, 40vw"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.12] group-hover:rotate-[6deg]" style={{ background: getGradient(ordered.a.slug) }} />
            )}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("${NOISE_SVG}")` }} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(2,10,24,0.95), rgba(2,10,24,0.1) 60%, transparent 100%)',
              }}
            />

            <div className="absolute bottom-0 left-0 right-0 p-6 z-[3]">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border font-sans text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{
                  borderColor: 'rgba(29,110,255,0.22)',
                  background: 'rgba(29,110,255,0.12)',
                  color: 'rgba(238,242,255,0.9)',
                }}
              >
                Category
              </span>
              <p className="mt-3 font-display text-[22px] md:text-[32px] font-extrabold tracking-[-0.04em]" style={{ color: 'var(--white)' }}>
                {ordered.a.name}
              </p>
              <p className="mt-1 font-sans text-[13px]" style={{ color: 'var(--muted)' }}>
                Explore products
              </p>
            </div>
            <div
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border opacity-0 translate-y-[-4px] transition-all duration-250 group-hover:opacity-100 group-hover:translate-y-0"
              style={{
                background: 'rgba(6,18,50,0.55)',
                borderColor: 'rgba(29,110,255,0.18)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <ArrowUpRight className="w-3 h-3" style={{ color: 'rgba(238,242,255,0.8)' }} />
            </div>
          </Link>
        )}

        {[ordered.b, ordered.c].filter(Boolean).map((cat) => (
          <Link
            key={cat!.id}
            href={`/shop?category=${encodeURIComponent(cat!.slug)}`}
            ref={(el) => {
              if (!el) return;
              cardsRef.current.set(cat!.id, el);
            }}
            data-cursor="interactive"
            className="group relative overflow-hidden cursor-pointer transition-all duration-300"
            style={{
              borderRadius: 14,
              border: '1px solid rgba(29,110,255,0.15)',
            }}
          >
            <div
              data-glow
              className="pointer-events-none absolute z-[2] w-[420px] h-[420px] rounded-full"
              style={{
                opacity: 0,
                transform: 'translate(-50%,-50%)',
                background: 'radial-gradient(circle, rgba(29,110,255,0.22), transparent 62%)',
                filter: 'blur(10px)',
                transition: 'opacity 0.2s ease',
              }}
            />
            {cat!.image ? (
              <Image
                src={cat!.image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.12] group-hover:rotate-[6deg]"
                sizes="(max-width: 1024px) 100vw, 20vw"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.12] group-hover:rotate-[6deg]" style={{ background: getGradient(cat!.slug) }} />
            )}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("${NOISE_SVG}")` }} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(2,10,24,0.95), rgba(2,10,24,0.1) 60%, transparent 100%)',
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-5 z-[3]">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border font-sans text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{
                  borderColor: 'rgba(29,110,255,0.22)',
                  background: 'rgba(29,110,255,0.12)',
                  color: 'rgba(238,242,255,0.9)',
                }}
              >
                Category
              </span>
              <p className="mt-3 font-display text-[22px] font-extrabold tracking-[-0.04em]" style={{ color: 'var(--white)' }}>
                {cat!.name}
              </p>
              <p className="mt-1 font-sans text-[13px]" style={{ color: 'var(--muted)' }}>
                Explore products
              </p>
            </div>
            <div
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border opacity-0 translate-y-[-4px] transition-all duration-250 group-hover:opacity-100 group-hover:translate-y-0"
              style={{
                background: 'rgba(6,18,50,0.55)',
                borderColor: 'rgba(29,110,255,0.18)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <ArrowUpRight className="w-3 h-3" style={{ color: 'rgba(238,242,255,0.8)' }} />
            </div>
          </Link>
        ))}

        {ordered.d && (
          <Link
            href={`/shop?category=${encodeURIComponent(ordered.d.slug)}`}
            ref={(el) => {
              if (!el) return;
              cardsRef.current.set(ordered.d.id, el);
            }}
            data-cursor="interactive"
            className="group relative overflow-hidden cursor-pointer transition-all duration-300"
            style={{
              gridColumn: '2 / span 2',
              borderRadius: 14,
              border: '1px solid rgba(29,110,255,0.15)',
            }}
          >
            <div
              data-glow
              className="pointer-events-none absolute z-[2] w-[520px] h-[520px] rounded-full"
              style={{
                opacity: 0,
                transform: 'translate(-50%,-50%)',
                background: 'radial-gradient(circle, rgba(29,110,255,0.22), transparent 62%)',
                filter: 'blur(10px)',
                transition: 'opacity 0.2s ease',
              }}
            />
            {ordered.d.image ? (
              <Image
                src={ordered.d.image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.12] group-hover:rotate-[6deg]"
                sizes="(max-width: 1024px) 100vw, 60vw"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.12] group-hover:rotate-[6deg]" style={{ background: getGradient(ordered.d.slug) }} />
            )}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("${NOISE_SVG}")` }} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(2,10,24,0.95), rgba(2,10,24,0.1) 60%, transparent 100%)',
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-[3]">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border font-sans text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{
                  borderColor: 'rgba(29,110,255,0.22)',
                  background: 'rgba(29,110,255,0.12)',
                  color: 'rgba(238,242,255,0.9)',
                }}
              >
                Category
              </span>
              <p className="mt-3 font-display text-[24px] md:text-[28px] font-extrabold tracking-[-0.04em]" style={{ color: 'var(--white)' }}>
                {ordered.d.name}
              </p>
              <p className="mt-1 font-sans text-[13px]" style={{ color: 'var(--muted)' }}>
                Explore products
              </p>
            </div>
            <div
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border opacity-0 translate-y-[-4px] transition-all duration-250 group-hover:opacity-100 group-hover:translate-y-0"
              style={{
                background: 'rgba(6,18,50,0.55)',
                borderColor: 'rgba(29,110,255,0.18)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <ArrowUpRight className="w-3 h-3" style={{ color: 'rgba(238,242,255,0.8)' }} />
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
