import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  description: string | null;
}

interface VendorSpotlightProps {
  stores: Store[];
}

const BANNER_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e, #2a1a3e)',
  'linear-gradient(135deg, #0f1a0f, #1a2e1a)',
  'linear-gradient(135deg, #1a0f0f, #2e1a0f)',
];

export function VendorSpotlight({ stores }: VendorSpotlightProps) {
  return (
    <section
      data-reveal
      data-reveal-stagger="1"
      className="py-[100px] px-6 md:px-10 lg:px-12 bg-[var(--bg)] border-t"
      style={{ borderColor: 'rgba(29,110,255,0.15)' }}
    >
      <div data-reveal-child className="text-center mb-12">
        <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)] inline-flex items-center gap-3 justify-center">
          <span className="inline-block w-7 h-px" style={{ background: 'rgba(0,200,255,0.7)' }} />
          Our community
        </p>
        <h2 className="mt-3 font-display font-extrabold leading-[1.05]" style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', letterSpacing: '-1.6px' }}>
          Meet Our <span className="insync-gradient-text italic">Vendors</span>
        </h2>
        <p className="font-sans text-[14px] mt-4 max-w-xl mx-auto leading-[1.8]" style={{ color: 'var(--muted)' }}>
          Independent stores curated for quality and authenticity.
        </p>
      </div>

      <div data-reveal-child className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stores.map((store, i) => (
          <Link
            key={store.id}
            href={`/store/${store.slug}`}
            data-cursor="interactive"
            className="group overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2"
            style={{
              borderRadius: 16,
              background: 'rgba(6,18,50,0.7)',
              border: '1px solid rgba(29,110,255,0.15)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 0 rgba(0,0,0,0)',
            }}
          >
            <div
              className="relative overflow-hidden bg-[var(--surface3)]"
              style={{ height: 200 }}
            >
              {store.banner ? (
                <Image
                  src={store.banner}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ background: BANNER_GRADIENTS[i % BANNER_GRADIENTS.length] }}
                />
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(2,10,24,0.2), rgba(2,10,24,0.75))' }} />
            </div>

            <div
              className="relative -mt-8 ml-6 w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
              style={{
                border: '2px solid var(--blue)',
                boxShadow: '0 0 24px rgba(29,110,255,0.35)',
                background: 'rgba(6,18,50,0.85)',
              }}
            >
              {store.logo ? (
                <Image src={store.logo} alt="" width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-[20px] font-extrabold insync-gradient-text">
                  {store.name.slice(0, 1)}
                </span>
              )}
            </div>

            <div className="p-6 pt-5">
              <h3 className="font-display text-[16px] font-extrabold mb-2" style={{ color: 'var(--white)', letterSpacing: '-0.6px' }}>
                {store.name}
              </h3>
              <p
                className="font-sans text-[13px] leading-[1.7] mb-5"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                  color: 'var(--muted)',
                }}
              >
                {store.description || 'Explore collection'}
              </p>
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center justify-center rounded-full px-3 py-1.5 border font-sans text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    borderColor: 'rgba(29,110,255,0.22)',
                    background: 'rgba(29,110,255,0.08)',
                    color: 'rgba(238,242,255,0.82)',
                  }}
                >
                  Vendors
                </span>
                <span className="ml-auto inline-flex items-center gap-2 rounded-[8px] px-4 py-2 border font-sans text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors"
                  style={{
                    borderColor: 'rgba(29,110,255,0.22)',
                    color: 'rgba(238,242,255,0.88)',
                    background: 'rgba(6,18,50,0.35)',
                  }}
                >
                  Visit store <ArrowRight className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
