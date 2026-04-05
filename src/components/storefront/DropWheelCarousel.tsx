'use client';

import Link from 'next/link';
import { memo, useEffect, useMemo, useRef } from 'react';
import type { Product, Store, Category } from '@prisma/client';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { formatPrice, getFirstProductImage } from '@/lib/utils';
import { useDisplaySettings } from '@/context/display-settings';
import { SectionReveal } from '@/components/motion/SectionReveal';
import { RevealItem } from '@/components/motion/RevealItem';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

const SPIN_DURATION = 16;

const WheelCard = memo(function WheelCard({
  product,
  angleDeg,
  rotateY,
  currencySymbol,
}: {
  product: ProductWithRelations;
  angleDeg: number;
  rotateY: ReturnType<typeof useMotionValue<number>>;
  currencySymbol: string;
}) {
  const img = getFirstProductImage(product.images);
  const price = Number(product.price);

  const frontness = useTransform(rotateY, (spin) => {
    const rad = ((spin + angleDeg) * Math.PI) / 180;
    return Math.max(0, Math.cos(rad));
  });

  const magnetic = useTransform(frontness, (f) => Math.pow(Math.min(1, f / 0.82), 2.4));

  const scale = useTransform(magnetic, [0, 1], [1, 1.15]);
  const brightness = useTransform(magnetic, [0, 1], [1, 1.25]);
  const filter = useTransform(brightness, (b) => `brightness(${b})`);

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: 220,
        height: 310,
        marginLeft: -110,
        marginTop: -155,
        transformStyle: 'preserve-3d',
        transform: `rotateY(${angleDeg}deg) translateZ(370px)`,
      }}
    >
      <motion.div className="h-full w-full" style={{ scale, filter }}>
        <Link
          href={`/product/${product.slug}`}
          data-cursor="interactive"
          className="insync-landing-product-shine insync-storefront-glass relative flex h-full w-full flex-col rounded-[14px] p-[18px] transition-[box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <div
            className="flex flex-1 items-center justify-center overflow-hidden rounded-[10px] border border-white/[0.06] bg-[rgba(29,110,255,.04)]"
            style={{ minHeight: 190 }}
          >
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="text-[68px]">🛍️</div>
            )}
          </div>
          <div className="mt-4 font-sans text-[8px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--cyan)' }}>
            {product.store.name}
          </div>
          <div className="mt-1 font-display text-[12px] font-semibold leading-[1.3]" style={{ color: 'var(--white)' }}>
            {product.title}
          </div>
          <div className="mt-2 font-display text-[18px] font-extrabold insync-gradient-text">
            {formatPrice(price, currencySymbol)}
          </div>
        </Link>
      </motion.div>
    </div>
  );
});

export function DropWheelCarousel({ products }: { products: ProductWithRelations[] }) {
  const { currencySymbol } = useDisplaySettings();
  const scaleRef = useRef<HTMLDivElement>(null);
  const rotateY = useMotionValue(0);

  const items = useMemo(() => products.slice(0, 7), [products]);

  useEffect(() => {
    rotateY.set(0);
    const ctrl = animate(rotateY, -360, {
      duration: SPIN_DURATION,
      repeat: Infinity,
      ease: 'linear',
    });
    return () => ctrl.stop();
  }, [rotateY]);

  useEffect(() => {
    const el = scaleRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const p = 1 - Math.max(0, Math.min(1, r.top / vh));
        const s = 0.95 + p * 0.05;
        el.style.transform = `scale(${s})`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <SectionReveal
      stagger
      className="relative overflow-hidden border-b border-white/10"
      style={{
        padding: '56px 0 48px',
        background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%)',
      }}
    >
      <div ref={scaleRef} className="origin-center transition-transform duration-100 ease-linear">
        <RevealItem>
          <div className="mx-auto max-w-[900px] px-6 text-center md:px-10 lg:px-12">
            <p className="inline-flex items-center justify-center gap-3 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--cyan)]">
              <span className="inline-block h-px w-7" style={{ background: 'rgba(0,200,255,0.7)' }} />
              Rotating Collection
            </p>
            <h2
              className="mt-4 font-display font-extrabold leading-[1.05]"
              style={{ fontSize: 'clamp(34px, 4.8vw, 62px)', letterSpacing: '-1.6px' }}
            >
              SPIN THE
              <br />
              <span className="insync-gradient-text italic">DROP WHEEL</span>
            </h2>
          </div>
        </RevealItem>

        <RevealItem className="mt-16">
          <div className="relative h-[420px]" style={{ perspective: 1100 }}>
            <motion.div
              className="absolute inset-0"
              style={{
                transformStyle: 'preserve-3d',
                rotateY: rotateY,
              }}
            >
              {items.map((p, i) => {
                const angle = (360 / Math.max(1, items.length)) * i;
                return (
                  <WheelCard
                    key={p.id}
                    product={p}
                    angleDeg={angle}
                    rotateY={rotateY}
                    currencySymbol={currencySymbol}
                  />
                );
              })}
            </motion.div>
          </div>

          <p className="mt-10 text-center font-sans text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>
            {items.length} products rotating
          </p>
        </RevealItem>
      </div>
    </SectionReveal>
  );
}
