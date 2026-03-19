'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@prisma/client';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

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

export function CategoryGrid({ categories }: CategoryGridProps) {
  const flatList = categories.flatMap((c) => [c, ...(c.children ?? [])]);
  const list = [...flatList]
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 5);
  const [first, ...rest] = list;

  return (
    <section className="py-20 px-12 bg-[var(--bg)]">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="section-label">Browse By</p>
          <h2 className="section-title mt-0">
            Shop by <em>Category</em>
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-[var(--gold)] hover:text-[var(--gold-dim)] transition-colors duration-150"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div
        className="grid gap-3 h-auto min-h-[400px] lg:h-[480px] grid-cols-1 lg:[grid-template-columns:2fr_1fr_1fr_1fr_1fr] lg:[grid-template-rows:1fr_1fr]"
      >
        {first && (
          <Link
            href={`/shop?category=${first.slug}`}
            className="group relative overflow-hidden rounded-[14px] cursor-pointer border transition-all duration-300 hover:border-[var(--line-gold)] hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] lg:row-span-2 min-h-[200px] lg:min-h-0"
            style={{ borderColor: 'var(--line)' }}
          >
            {first.image ? (
              <Image
                src={first.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0" style={{ background: getGradient(first.slug) }} />
            )}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("${NOISE_SVG}")` }} />
            <div className="absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-3)] mt-1 mb-2">
                Collection
              </p>
              <p className="font-display text-[32px] font-normal text-[var(--text)]">{first.name}</p>
            </div>
            <div
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border opacity-0 translate-y-[-4px] transition-all duration-250 group-hover:opacity-100 group-hover:translate-y-0"
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <ArrowUpRight className="w-3 h-3 text-[var(--text-2)]" />
            </div>
          </Link>
        )}
        {rest.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${encodeURIComponent(cat.slug)}`}
            className="relative overflow-hidden rounded-[14px] cursor-pointer border transition-all duration-300 hover:border-[var(--line-gold)] hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] group"
            style={{ borderColor: 'var(--line)' }}
          >
            {cat.image ? (
              <Image
                src={cat.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 20vw"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0" style={{ background: getGradient(cat.slug) }} />
            )}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("${NOISE_SVG}")` }} />
            <div className="absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-3)] mt-1 mb-2">
                Collection
              </p>
              <p className="font-display text-[22px] font-normal text-[var(--text)]">{cat.name}</p>
            </div>
            <div
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border opacity-0 translate-y-[-4px] transition-all duration-250 group-hover:opacity-100 group-hover:translate-y-0"
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <ArrowUpRight className="w-3 h-3 text-[var(--text-2)]" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
