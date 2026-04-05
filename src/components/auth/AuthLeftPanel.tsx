'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  CheckCircle,
  Store,
  Shield,
  Heart,
  LayoutDashboard,
  Package,
  Tag,
  Star,
} from 'lucide-react';
import { AuthParticleCanvas } from '@/components/auth/AuthParticleCanvas';

const AUTH_BG_IMAGES = [
  'https://plus.unsplash.com/premium_photo-1664537981586-e550b3bd9872?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&auto=format&fit=crop&q=80',
];

const LOGIN_CONTENT = {
  headline: 'Welcome back.',
  tagline: "We're glad to see you again.",
  features: [
    { icon: Package, title: 'Your Orders', subtitle: 'Track and manage your purchases' },
    { icon: Heart, title: 'Wishlist', subtitle: 'Save items and get back to them anytime' },
    { icon: LayoutDashboard, title: 'Vendor Dashboard', subtitle: 'Manage products and orders if you sell' },
  ],
};

const REGISTER_CONTENT = {
  tagline: 'One account. Shop or sell.',
  body: 'Create an account to browse curated fashion, buy from trusted vendors, or open your own store and start selling.',
  features: [
    { icon: CheckCircle, title: 'Curated products', subtitle: '500+ items from trusted vendors' },
    { icon: Store, title: 'Sell with us', subtitle: 'Open your store in minutes' },
    { icon: Shield, title: 'Secure checkout', subtitle: 'Safe payments & buyer protection' },
    { icon: Tag, title: 'Exclusive offers', subtitle: 'Member-only deals and early access' },
  ],
};

function StatCell({
  target,
  suffix,
  label,
}: {
  target: number;
  suffix: string;
  label: string;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const dur = 1600;
    const t0 = performance.now();
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      const eased = 1 - (1 - u) ** 3;
      setN(Math.round(target * eased));
      if (u < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center border-r border-[var(--border)] py-4 last:border-r-0">
      <span className="font-display text-[20px] font-bold leading-none text-gradient-insync">
        {n}
        {suffix}
      </span>
      <span className="mt-1.5 font-sans text-[10.5px] font-medium uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
    </div>
  );
}

export function AuthLeftPanel() {
  const pathname = usePathname();
  const isLogin = pathname === '/auth/login';
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % AUTH_BG_IMAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const loginDelays = ['0.1s', '0.25s', '0.4s'];

  return (
    <div className="auth-left-panel relative hidden min-h-0 flex-col justify-between overflow-hidden px-10 pb-12 pt-10 lg:flex lg:px-14">
      <div className="absolute inset-0">
        {AUTH_BG_IMAGES.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
            style={{
              opacity: i === bgIndex ? 1 : 0,
              zIndex: i === bgIndex ? 0 : -1,
            }}
            aria-hidden={i !== bgIndex}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>

      <AuthParticleCanvas className="absolute inset-0 z-[1]" />

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(2,10,24,0.55) 0%, rgba(2,10,24,0.82) 55%, rgba(2,10,24,0.88) 100%)',
        }}
        aria-hidden
      />

      <div className={`relative z-10 flex min-h-0 flex-1 flex-col justify-center ${isLogin ? '-mt-2' : ''}`}>
        {isLogin ? (
          <>
            <h1
              className="font-display text-[42px] font-black leading-[1.12] tracking-tight text-white lg:text-[52px]"
              style={{ fontWeight: 900 }}
            >
              {LOGIN_CONTENT.headline}
            </h1>
            <p className="mt-4 max-w-[360px] font-sans text-xl italic text-[var(--muted)]">
              {LOGIN_CONTENT.tagline}
            </p>
            <div className="mt-8 flex max-w-[320px] flex-col gap-3">
              {LOGIN_CONTENT.features.map((item, i) => (
                <div
                  key={item.title}
                  className="auth-feat-card rounded-[12px] border border-[var(--border)] bg-[var(--card-bg)] p-4 backdrop-blur-[20px] transition-all duration-300 ease-out hover:border-[var(--cyan)] hover:shadow-[0_0_20px_rgba(0,200,255,0.15)]"
                  style={{ animationDelay: loginDelays[i] }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: 'rgba(29,110,255,0.2)',
                        boxShadow: '0 0 18px rgba(29,110,255,0.35)',
                      }}
                    >
                      <item.icon className="h-[18px] w-[18px] text-[var(--blue)]" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-[13px] font-semibold text-white">{item.title}</p>
                      <p className="mt-0.5 font-sans text-[12px] text-[var(--muted)]">{item.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1
              className="font-display text-[42px] font-black leading-[1.12] tracking-tight text-white lg:text-[48px]"
              style={{ fontWeight: 900 }}
            >
              Join <span className="text-gradient-insync">InsyncX</span>.
            </h1>
            <p className="mt-4 max-w-[360px] font-sans text-xl italic text-[var(--muted)]">{REGISTER_CONTENT.tagline}</p>
            <p className="mt-4 max-w-[360px] font-sans text-[15px] leading-relaxed text-[var(--muted)]">
              {REGISTER_CONTENT.body}
            </p>

            <div
              className="auth-feat-card mt-6 flex max-w-[360px] flex-row overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--card-bg)] backdrop-blur-[20px]"
              style={{ animationDelay: '0.2s' }}
            >
              <StatCell target={50} suffix="K+" label="Members" />
              <StatCell target={500} suffix="+" label="Vendors" />
              <StatCell target={10} suffix="K+" label="Products" />
            </div>

            <div
              className="auth-feat-card relative mt-4 max-w-[360px] rounded-[12px] border border-[var(--border)] bg-[var(--card-bg)] p-4 backdrop-blur-[20px]"
              style={{ animationDelay: '0.5s' }}
            >
              <span className="font-display -ml-0.5 -mt-1 block text-[40px] leading-none text-[var(--blue)]/25">
                &ldquo;
              </span>
              <p className="-mt-4 font-sans text-[13px] font-light italic leading-relaxed text-[var(--muted)]">
                Opened my store in under 10 minutes. First sale came the same week.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold text-gradient-insync"
                  style={{
                    background: 'linear-gradient(135deg, rgba(29,110,255,0.35), rgba(0,200,255,0.2))',
                  }}
                >
                  AR
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-[12px] font-medium text-white">Aisha R.</p>
                  <p className="font-sans text-[11px] text-[var(--muted)]">Verified vendor · Lagos</p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-[#4da6ff]" style={{ color: '#4da6ff' }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 grid max-w-[360px] grid-cols-2 gap-2">
              {REGISTER_CONTENT.features.map((item, i) => (
                <div
                  key={item.title}
                  className="auth-feat-card rounded-[12px] border border-[var(--border)] bg-[var(--card-bg)] p-3 backdrop-blur-[20px] transition-all duration-300 ease-out hover:border-[var(--cyan)] hover:shadow-[0_0_20px_rgba(0,200,255,0.12)]"
                  style={{ animationDelay: `${0.65 + i * 0.08}s` }}
                >
                  <div
                    className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full"
                    style={{
                      background: 'rgba(29,110,255,0.2)',
                      boxShadow: '0 0 14px rgba(29,110,255,0.3)',
                    }}
                  >
                    <item.icon className="h-4 w-4 text-[var(--blue)]" strokeWidth={2} />
                  </div>
                  <p className="text-center font-sans text-[12px] font-semibold text-white">{item.title}</p>
                  <p className="mt-0.5 text-center font-sans text-[11px] text-[var(--muted)]">{item.subtitle}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <p className="relative z-10 mt-8 font-sans text-[12px] text-[var(--muted)]">
        © {new Date().getFullYear()}{' '}
        <span className="font-semibold text-white">Insync</span>
        <span className="text-gradient-insync">X</span>. All rights reserved.
      </p>
    </div>
  );
}
