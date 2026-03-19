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
    <section className="py-20 px-12 bg-[var(--bg)] border-t" style={{ borderColor: 'var(--line)' }}>
      <div className="text-center mb-12">
        <p className="section-label">Our Community</p>
        <h2 className="section-title mt-0">
          Meet Our <em>Vendors</em>
        </h2>
        <p className="font-sans text-[14px] text-[var(--text-3)] mt-3 max-w-xl mx-auto">
          Independent stores curated for quality and authenticity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stores.map((store, i) => (
          <Link
            key={store.id}
            href={`/store/${store.slug}`}
            className="card card-hover overflow-hidden cursor-pointer"
          >
            <div
              className="relative overflow-hidden bg-[var(--surface3)]"
              style={{ aspectRatio: '16/7' }}
            >
              {store.banner ? (
                <Image
                  src={store.banner}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ background: BANNER_GRADIENTS[i % BANNER_GRADIENTS.length] }}
                />
              )}
              <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="relative -mt-6 ml-5 w-12 h-12 rounded-full border-2 border-[var(--surface)] overflow-hidden flex items-center justify-center bg-[var(--gold-bg)]">
              {store.logo ? (
                <Image src={store.logo} alt="" width={48} height={48} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-[20px] font-normal text-[var(--gold)]">
                  {store.name.slice(0, 1)}
                </span>
              )}
            </div>

            <div className="p-4 pt-4 pb-5" style={{ paddingLeft: 20, paddingRight: 20 }}>
              <h3 className="font-display text-[22px] font-normal text-[var(--text)] mb-1.5">
                {store.name}
              </h3>
              <p
                className="font-sans text-[13px] text-[var(--text-3)] leading-[1.5] mb-4 line-clamp-2"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                }}
              >
                {store.description || 'Explore collection'}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-sans text-[12px] text-[var(--text-4)]">
                  Shop now
                </span>
                <span className="inline-flex items-center gap-1 font-sans text-[12px] font-medium text-[var(--gold)] hover:text-[var(--gold-dim)] transition-colors duration-150">
                  Visit Store <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
