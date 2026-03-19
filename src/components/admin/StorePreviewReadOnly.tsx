import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface StorePreviewReadOnlyProps {
  store: { name: string; slug: string; logo: string | null; banner: string | null };
}

export function StorePreviewReadOnly({ store }: StorePreviewReadOnlyProps) {
  return (
    <div
      className="rounded-2xl border overflow-hidden mb-8"
      style={{ borderColor: 'var(--line)', background: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}
    >
      <div
        className="relative"
        style={{ aspectRatio: '21/6', minHeight: 180, background: 'var(--surface3)' }}
      >
        {store.banner ? (
          <Image src={store.banner} alt="" fill className="object-cover" priority sizes="(max-width: 1200px) 100vw, 1200px" />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--surface3) 0%, var(--surface2) 100%)' }}
          >
            <span className="font-sans text-[13px]" style={{ color: 'var(--text-4)' }}>
              No banner
            </span>
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.85) 0%, transparent 50%)' }}
        />
      </div>
      <div className="p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-2xl border-2 overflow-hidden shrink-0 flex items-center justify-center"
            style={{ borderColor: 'var(--line-gold)', background: 'var(--gold-bg)' }}
          >
            {store.logo ? (
              <Image src={store.logo} alt="" width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              <span className="font-display text-[32px] font-normal" style={{ color: 'var(--gold)' }}>
                {store.name.slice(0, 1)}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-display text-[26px] font-normal tracking-tight" style={{ color: 'var(--text)' }}>
              {store.name}
            </h2>
            <p className="font-sans text-[13px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              /store/{store.slug}
            </p>
          </div>
        </div>
        <Link
          href={`/store/${store.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-sans text-[14px] font-semibold transition-colors hover:opacity-90"
          style={{ background: 'var(--gold)', color: '#000' }}
        >
          View store
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
