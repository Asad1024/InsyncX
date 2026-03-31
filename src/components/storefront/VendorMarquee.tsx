'use client';

import Link from 'next/link';
import { useMemo } from 'react';

type StoreLite = { name: string; slug: string };

function Row({ items, reverse }: { items: StoreLite[]; reverse?: boolean }) {
  const duplicated = [...items, ...items];
  return (
    <div
      className="flex w-max items-center"
      style={{
        animation: `${reverse ? 'marqueeRight' : 'marqueeLeft'} 22s linear infinite`,
      }}
    >
      {duplicated.map((s, i) => (
        <Link
          key={`${s.slug}-${i}`}
          href={`/store/${s.slug}`}
          data-cursor="interactive"
          className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 mr-3"
          style={{
            borderColor: 'rgba(29,110,255,0.15)',
            background: 'rgba(6,18,50,0.35)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--blue)' }} />
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'rgba(238,242,255,0.72)' }}>
            {s.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function VendorMarquee({ stores }: { stores: StoreLite[] }) {
  const items = useMemo(() => {
    if (stores.length > 0) return stores;
    return [{ name: 'INSYNC Store', slug: 'insync' }];
  }, [stores]);

  return (
    <section
      data-reveal
      className="py-[60px] overflow-hidden border-t border-b"
      style={{ borderColor: 'rgba(29,110,255,0.15)' }}
    >
      <div data-reveal-child className="text-center px-6 md:px-10 lg:px-12">
        <p className="font-sans text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--muted)' }}>
          Our Verified Vendors
        </p>
      </div>

      <div data-reveal-child className="mt-8 overflow-hidden">
        <Row items={items} />
        <div className="mt-3">
          <Row items={items} reverse />
        </div>
      </div>
    </section>
  );
}

