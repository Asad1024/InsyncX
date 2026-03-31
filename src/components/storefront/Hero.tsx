'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useDisplaySettings } from '@/context/display-settings';
import { formatPrice, getFirstProductImage } from '@/lib/utils';
import type { Product, Store, Category } from '@prisma/client';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type ProductWithRelations = Product & {
  store: Pick<Store, 'name' | 'slug' | 'isOfficial'>;
  category: Pick<Category, 'name' | 'slug'>;
};

interface HeroProps {
  featuredProducts?: ProductWithRelations[];
}

function HeroParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { positions, colors } = useMemo(() => {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cA = new THREE.Color('#1d6eff');
    const cB = new THREE.Color('#00c8ff');
    const cC = new THREE.Color('#6094ff');
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      const r = 1.12 + (Math.random() - 0.5) * 0.06;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const t = Math.random();
      if (t < 0.34) tmp.copy(cA);
      else if (t < 0.67) tmp.copy(cB);
      else tmp.copy(cC);

      col[i * 3 + 0] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }

    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.12;
      pointsRef.current.rotation.x = t * 0.06;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = mouse.x * 0.06;
      groupRef.current.rotation.x = -mouse.y * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.016} vertexColors transparent opacity={0.9} depthWrite={false} />
      </points>

      <mesh>
        <icosahedronGeometry args={[1.22, 1]} />
        <meshBasicMaterial color="#1d6eff" wireframe transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

export function Hero({ featuredProducts = [] }: HeroProps) {
  const displaySettings = useDisplaySettings();
  const heroRef = useRef<HTMLElement | null>(null);
  const [heroActive, setHeroActive] = useState(true);
  const freeShippingText =
    displaySettings.freeShippingThreshold != null
      ? `Free shipping on orders over ${formatPrice(displaySettings.freeShippingThreshold, displaySettings.currencySymbol)}`
      : null;

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        setHeroActive(!!e?.isIntersecting);
      },
      { threshold: 0.05, rootMargin: '400px 0px 400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stackProducts = featuredProducts.slice(0, 1);
  const stats = useMemo(() => {
    const storeCount = new Set(featuredProducts.map((p) => p.store?.slug).filter(Boolean)).size;
    const categoryCount = new Set(featuredProducts.map((p) => p.category?.slug).filter(Boolean)).size;
    return [
      { value: `${Math.max(8, featuredProducts.length)}+`, label: 'Featured drops' },
      { value: `${Math.max(3, storeCount)}+`, label: 'Vendors live' },
      { value: `${Math.max(6, categoryCount)}+`, label: 'Categories' },
    ];
  }, [featuredProducts]);

  return (
    <section
      ref={(n) => {
        heroRef.current = n;
      }}
      className="relative w-full overflow-hidden"
      style={{ minHeight: 'calc(88vh - var(--nav-h))' }}
    >
      {/* Background (no photos) */}
      <div className="absolute inset-0 left-0 top-0 h-full w-full">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 90% at 50% 45%, rgba(29,110,255,0.10), transparent 60%), radial-gradient(circle at 12% 18%, rgba(0,200,255,0.10), transparent 45%), linear-gradient(135deg, rgba(2,10,24,1) 0%, rgba(2,10,24,0.55) 55%, rgba(2,10,24,1) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(2,10,24,0.85) 0%, rgba(2,10,24,0.4) 50%, rgba(2,10,24,0.75) 100%)',
          }}
        />
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
            mixBlendMode: 'multiply',
          }}
        />
      </div>

      {/* Three.js particles behind content */}
      {heroActive && (
        <div className="absolute inset-0 z-[0] pointer-events-none">
          <Canvas
            camera={{ position: [0, 0, 3.2], fov: 52 }}
            dpr={[1, 1.25]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={0.6} />
            <HeroParticles />
          </Canvas>
        </div>
      )}

      {/* Layout */}
      <div
        className="relative z-10 max-w-[var(--content-max)] mx-auto px-6 md:px-10 lg:px-12 pt-4 md:pt-8 lg:pt-10"
      >
        <div className="grid items-start gap-12 lg:gap-16 lg:grid-cols-2 pt-2 md:pt-4" style={{ minHeight: 'calc(88vh - var(--nav-h))' }}>
          {/* Left */}
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border animate-fade-up"
              style={{
                borderColor: 'rgba(29,110,255,0.3)',
                background: 'rgba(29,110,255,0.06)',
                backdropFilter: 'blur(18px)',
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: 'var(--cyan)', boxShadow: '0 0 18px rgba(0,200,255,0.55)', animation: 'insyncBlink 1.1s ease-in-out infinite' }}
              />
              <span className="font-sans text-[12px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--cyan)' }}>
                New Collection 2026
              </span>
            </div>

            <h1
              className="mt-6 font-display font-black leading-[1.0]"
              style={{ fontSize: 'clamp(50px, 6.0vw, 88px)', letterSpacing: '-2px' }}
            >
              <span className="insync-gradient-text">SHOP</span>{' '}
              <span
                style={{
                  WebkitTextStroke: '2px rgba(238,242,255,0.25)',
                  color: 'transparent',
                }}
              >
                INSYNC
              </span>{' '}
              <span className="insync-gradient-text">DIFFERENT</span>
            </h1>

            <p className="mt-5 font-sans text-[14px] font-light leading-[1.7] max-w-[420px]" style={{ color: 'var(--muted)' }}>
              Curated multi-vendor drops, official picks, and fresh arrivals—built for momentum. Discover pieces that move with you.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-[8px] px-6 py-3 font-sans text-[13px] font-semibold uppercase tracking-[0.12em]"
                style={{
                  background: 'linear-gradient(135deg, var(--blue), var(--blue-mid))',
                  boxShadow: '0 0 28px rgba(29,110,255,0.45)',
                  color: 'var(--white)',
                }}
              >
                Discover
              </Link>
              <a
                href="#fresh-arrivals"
                className="inline-flex items-center justify-center rounded-[8px] px-6 py-3 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] border"
                style={{
                  borderColor: 'rgba(29,110,255,0.3)',
                  background: 'rgba(6,18,50,0.35)',
                  color: 'var(--white)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                New arrivals
              </a>
            </div>

            <div className="mt-10 pt-6 border-t" style={{ borderTopColor: 'rgba(29,110,255,0.15)' }}>
              <div className="grid grid-cols-3 gap-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display font-extrabold insync-gradient-text" style={{ fontSize: 22, letterSpacing: '-0.8px' }}>
                      {s.value}
                    </div>
                    <div className="mt-1 font-sans text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--muted)' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="hidden md:flex items-center gap-3 mt-10" style={{ color: 'rgba(238,242,255,0.65)' }}>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em]">Scroll</span>
              <span
                className="relative block w-12 h-[2px] overflow-hidden rounded-full"
                style={{ background: 'rgba(29,110,255,0.18)' }}
              >
                <span
                  className="absolute left-0 top-0 h-full w-1/3"
                  style={{
                    background: 'linear-gradient(90deg, var(--blue), var(--cyan))',
                    animation: 'marqueeLeft 1.2s linear infinite',
                  }}
                />
              </span>
            </div>
          </div>

          {/* Right: product stack */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[min(440px,100%)]">
              {/* Floating badges */}
              <div
                className="absolute top-0 right-2 z-20 translate-y-[14px] rounded-full px-4 py-2"
                style={{
                  background: 'linear-gradient(90deg, var(--blue), var(--cyan))',
                  color: '#001028',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  animation: 'insyncFloat 3.2s ease-in-out infinite',
                }}
              >
                🔥 Just Dropped
              </div>

              {freeShippingText && (
                <div
                  className="absolute -bottom-4 left-2 z-20 rounded-full px-4 py-2 border"
                  style={{
                    background: 'rgba(6,18,50,0.75)',
                    borderColor: 'rgba(29,110,255,0.2)',
                    color: 'rgba(238,242,255,0.8)',
                    backdropFilter: 'blur(20px)',
                    animation: 'insyncFloat 3.9s ease-in-out infinite',
                  }}
                >
                  {freeShippingText}
                </div>
              )}

              <div className="insync-hero-card-wrap" data-cursor="interactive">
                {stackProducts.map((p, i) => {
                  const img = getFirstProductImage(p.images);
                  const price = Number(p.price);
                  const cls = 'hc-single';
                  return (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      className={`insync-hero-card ${cls}`}
                      style={{
                        background: 'var(--card-bg)',
                      }}
                    >
                      <div className="insync-hc-img">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[56px]">🛍️</div>
                        )}
                      </div>
                      <div className="insync-hc-vendor">{p.store?.name}</div>
                      <div className="insync-hc-name">{p.title}</div>
                      <div className="insync-hc-row">
                        <div className="insync-hc-price">{formatPrice(price, displaySettings.currencySymbol)}</div>
                        <span className="insync-hc-btn">Add</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background scrolling text */}
      <div className="absolute left-0 right-0 bottom-[8%] z-[1] pointer-events-none overflow-hidden">
        <div
          className="whitespace-nowrap"
          style={{
            fontSize: 'clamp(100px, 14vw, 200px)',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            WebkitTextStroke: '1px rgba(29,110,255,0.12)',
            color: 'transparent',
            letterSpacing: '-1.5px',
            animation: 'insyncScrollText 20s linear infinite',
          }}
        >
          <span>
            SHOP · INSYNC · DROP · DIFFERENT · SHOP · INSYNC · DROP · DIFFERENT · SHOP · INSYNC · DROP · DIFFERENT ·{' '}
          </span>
          <span>
            SHOP · INSYNC · DROP · DIFFERENT · SHOP · INSYNC · DROP · DIFFERENT · SHOP · INSYNC · DROP · DIFFERENT ·{' '}
          </span>
        </div>
      </div>

      <style jsx global>{`
        .insync-hero-card-wrap {
          position: relative;
          width: 300px;
          height: 360px;
          perspective: 900px;
          margin-left: auto;
          margin-right: auto;
          overflow: visible;
        }
        @media (min-width: 1024px) {
          .insync-hero-card-wrap {
            transform: translateX(26px);
          }
        }
        @media (max-width: 640px) {
          .insync-hero-card-wrap {
            width: 280px;
            height: 345px;
          }
        }
        .insync-hero-card {
          position: absolute;
          width: 270px;
          left: 0;
          top: 0;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid var(--border);
          backdrop-filter: blur(20px);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
          transform-style: preserve-3d;
          color: var(--white);
          z-index: 1;
        }
        /* Stronger border shine (like a glowing CTA) */
        .insync-hero-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          background: linear-gradient(
            120deg,
            rgba(0, 200, 255, 0) 0%,
            rgba(0, 200, 255, 0.55) 40%,
            rgba(29, 110, 255, 0.0) 75%,
            rgba(29, 110, 255, 0) 100%
          );
          transform: translateX(-95%) rotate(0.001deg);
          opacity: 0.9;
          pointer-events: none;
          mix-blend-mode: screen;
          filter: blur(1.2px);
          animation: insyncHeroShine 3.2s ease-in-out infinite;
        }
        .insync-hero-card::before {
          /* keep shine in the border only */
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          padding: 1px;
        }
        .insync-hero-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          pointer-events: none;
          background: radial-gradient(120% 80% at 50% 0%, rgba(29, 110, 255, 0.18), rgba(0, 0, 0, 0) 58%);
          opacity: 0.55;
        }
        @media (max-width: 640px) {
          .insync-hero-card {
            width: 250px;
          }
        }
        .hc-single {
          transform: translate(78px, 72px) rotate(0deg) translateZ(0px);
          z-index: 3;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 0 64px rgba(29, 110, 255, 0.22);
          animation: insyncHeroBob 3.4s ease-in-out infinite;
        }
        .insync-hc-img {
          width: 100%;
          height: 155px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 56px;
          margin-bottom: 14px;
          background: linear-gradient(135deg, rgba(29, 110, 255, 0.15), rgba(0, 200, 255, 0.08));
          position: relative;
          overflow: hidden;
        }
        .insync-hc-img::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 50%, rgba(0, 200, 255, 0.12));
          pointer-events: none;
        }
        .insync-hc-vendor {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--cyan);
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .insync-hc-name {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 600;
          line-height: 1.3;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .insync-hc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .insync-hc-price {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 800;
          color: var(--cyan);
          white-space: nowrap;
        }
        .insync-hc-btn {
          background: linear-gradient(135deg, var(--blue), var(--blue-mid));
          color: #fff;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 0 0 18px rgba(29, 110, 255, 0.25);
          user-select: none;
        }

        /* Bring hovered card above the whole stack (without flattening transforms) */
        .hc-1:hover {
          z-index: 10;
          transform: translate(0px, 18px) rotate(-8deg) translateZ(-10px) scale(1.02);
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55), 0 0 44px rgba(29, 110, 255, 0.22);
        }
        .hc-2:hover {
          z-index: 10;
          transform: translate(22px, 9px) rotate(2deg) translateZ(10px) scale(1.02);
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55), 0 0 44px rgba(29, 110, 255, 0.22);
        }
        .hc-3:hover {
          z-index: 10;
          transform: translate(14px, 0px) rotate(0deg) translateZ(30px) scale(1.02);
          box-shadow: 0 34px 76px rgba(0, 0, 0, 0.65), 0 0 54px rgba(29, 110, 255, 0.26);
        }
        @keyframes insyncHeroBob {
          0%,
          100% {
            transform: translate(var(--x, 0px), var(--y, 0px)) rotate(var(--r, 0deg)) translateZ(var(--z, 0px));
          }
          50% {
            transform: translate(var(--x, 0px), calc(var(--y, 0px) - 10px)) rotate(var(--r, 0deg)) translateZ(var(--z, 0px));
          }
        }
        @keyframes insyncHeroShine {
          0% {
            transform: translateX(-95%) skewX(-14deg);
            opacity: 0.55;
          }
          50% {
            transform: translateX(12%) skewX(-14deg);
            opacity: 1;
          }
          100% {
            transform: translateX(110%) skewX(-14deg);
            opacity: 0.6;
          }
        }

        /* Configure bob vars per card */
        .hc-single {
          --x: 78px;
          --y: 72px;
          --r: 0deg;
          --z: 0px;
        }
      `}</style>
    </section>
  );
}
