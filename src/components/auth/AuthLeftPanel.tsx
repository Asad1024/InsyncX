'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Store, Shield, Heart, LayoutDashboard, Package, Tag, Star } from 'lucide-react';

// Same hero images — change every 3s
const AUTH_BG_IMAGES = [
  'https://plus.unsplash.com/premium_photo-1664537981586-e550b3bd9872?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620226346750-3aea895ac33f?w=1920&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589363460779-cd717d2ed8fa?w=1920&auto=format&fit=crop&q=80',
  'https://plus.unsplash.com/premium_photo-1708633003240-569a6135deaa?w=1920&auto=format&fit=crop&q=80',
  'https://plus.unsplash.com/premium_photo-1682435561654-20d84cef00eb?w=1920&auto=format&fit=crop&q=80',
];

const LOGIN_CONTENT = {
  headline: 'Welcome back.',
  tagline: "We're glad to see you again.",
  body: 'Sign in to access your account—track orders, manage your store, or continue shopping where you left off.',
  body2: null as string | null,
  features: [
    { icon: Package, title: 'Your orders', subtitle: 'Track and manage your purchases' },
    { icon: Heart, title: 'Wishlist', subtitle: 'Save items and get back to them anytime' },
    { icon: LayoutDashboard, title: 'Vendor dashboard', subtitle: 'Manage products and orders if you sell' },
  ],
};

const REGISTER_CONTENT = {
  headline: 'Join InsyncX.',
  tagline: 'One account. Shop or sell.',
  body: 'Create an account to browse curated fashion, buy from trusted vendors, or open your own store and start selling.',
  body2: 'Free to join. No hidden fees. Add payment details only when you’re ready to buy or receive payouts as a vendor.',
  features: [
    { icon: CheckCircle, title: 'Curated products', subtitle: '500+ items from trusted vendors' },
    { icon: Store, title: 'Sell with us', subtitle: 'Open your store in minutes' },
    { icon: Shield, title: 'Secure checkout', subtitle: 'Safe payments & buyer protection' },
    { icon: Tag, title: 'Exclusive offers', subtitle: 'Member-only deals and early access to sales' },
  ],
};

export function AuthLeftPanel() {
  const pathname = usePathname();
  const isLogin = pathname === '/auth/login';
  const content = isLogin ? LOGIN_CONTENT : REGISTER_CONTENT;
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % AUTH_BG_IMAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="auth-left-panel hidden lg:flex flex-col justify-between pt-8 pb-12 px-14 relative overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, var(--surface) 0%, var(--surface2) 50%, #0f0f12 100%)',
      }}
    >
      {/* Background images — same as hero, change every 3s */}
      <div className="absolute inset-0">
        {AUTH_BG_IMAGES.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 pointer-events-none"
            style={{
              opacity: i === bgIndex ? 1 : 0,
              zIndex: i === bgIndex ? 0 : -1,
            }}
            aria-hidden={i !== bgIndex}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
        {/* Lighter overlay so background images show through */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'linear-gradient(165deg, rgba(9,9,11,0.72) 0%, rgba(15,15,18,0.68) 50%, rgba(9,9,11,0.78) 100%)',
          }}
          aria-hidden
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none auth-gradient-shift z-[2]"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(74,144,226,0.08) 0%, transparent 50%)',
        }}
        aria-hidden
      />
      {/* Logo anchored top-left so both panels show the brand */}
      <div className={`relative z-10 w-full flex justify-start ${isLogin ? 'mb-6' : 'mb-2'}`}>
        <div className="relative shrink-0" style={{ width: 220, height: 56 }}>
          <Image
            src="/InsyncX%20logo.avif"
            alt="InsyncX"
            fill
            className="object-contain object-left"
            sizes="220px"
            priority
          />
        </div>
      </div>
      <div className={`relative z-10 flex-1 flex flex-col justify-center min-h-0 ${isLogin ? '-mt-2' : ''}`}>
        <h1
          className="font-display text-[42px] lg:text-[48px] font-light leading-[1.15] tracking-tight text-white opacity-0 auth-fade-in-up"
          style={{ animationDelay: '0.15s', animationFillMode: 'forwards', fontWeight: 700 }}
        >
          {content.headline.includes('InsyncX') ? (
            <>
              {content.headline.split('InsyncX')[0]}
              <span className="font-semibold">Insync</span>
              <span style={{ color: '#4a90e2' }}>X</span>
              {content.headline.split('InsyncX')[1] ?? ''}
            </>
          ) : (
            content.headline
          )}
        </h1>
        <p
          className="font-display text-xl italic mt-4 text-white/90 opacity-0 auth-fade-in-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
        >
          {content.tagline}
        </p>
        <p
          className="font-sans text-[15px] mt-6 max-w-[340px] leading-relaxed text-white/80 opacity-0 auth-fade-in-up"
          style={{ animationDelay: '0.45s', animationFillMode: 'forwards', fontWeight: 400 }}
        >
          {content.body}
        </p>
        {content.body2 && (
          <p
            className="font-sans text-[13px] mt-4 max-w-[340px] leading-relaxed text-white/70 opacity-0 auth-fade-in-up"
            style={{ animationDelay: '0.55s', animationFillMode: 'forwards' }}
          >
            {content.body2}
          </p>
        )}

        {/* Register only: stats bar */}
        {!isLogin && (
          <div
            className="flex flex-row opacity-0 auth-fade-in-up mt-5 max-w-[340px] rounded-xl border backdrop-blur-[12px]"
            style={{
              animationDelay: '0.6s',
              animationFillMode: 'forwards',
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.07)',
            }}
          >
            {[
              { num: '50K+', label: 'Members' },
              { num: '500+', label: 'Vendors' },
              { num: '10K+', label: 'Products' },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="flex-1 flex flex-col items-center justify-center py-4 px-3.5 border-r last:border-r-0 border-white/7"
                style={{ borderRightColor: idx < 2 ? 'rgba(255,255,255,0.07)' : 'transparent' }}
              >
                <span className="font-display font-bold text-[20px]" style={{ color: '#4a90e2' }}>{stat.num}</span>
                <span className="font-sans text-[10.5px] mt-0.5 text-white/60" style={{ fontWeight: 300 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Register only: testimonial card */}
        {!isLogin && (
          <div
            className="opacity-0 auth-fade-in-up mt-4 max-w-[340px] rounded-[11px] border p-4 backdrop-blur-md relative"
            style={{
              animationDelay: '0.7s',
              animationFillMode: 'forwards',
              background: 'rgba(255,255,255,0.035)',
              borderColor: 'rgba(255,255,255,0.07)',
            }}
          >
            <span className="font-display block text-[40px] leading-none -mt-1 -ml-0.5" style={{ color: 'rgba(74,144,226,0.2)' }}>&ldquo;</span>
            <p className="font-sans text-[13px] italic leading-relaxed text-white/70 -mt-4" style={{ fontWeight: 300, lineHeight: 1.6 }}>
              Opened my store in under 10 minutes. First sale came the same week.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-display text-[11px] font-bold" style={{ background: 'var(--surface3)', color: '#4a90e2' }}>AR</div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[12px] font-medium text-white truncate">Aisha R.</p>
                <p className="font-sans text-[11px] text-white/60">Verified vendor · Lagos</p>
              </div>
              <div className="flex gap-0.5 shrink-0">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#4a90e2]" style={{ color: '#4a90e2' }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feature cards: login = 3 stacked, register = 2×2 grid */}
        <div
          className={`relative z-10 mt-6 ${isLogin ? 'flex flex-col gap-3 max-w-[320px]' : 'grid grid-cols-2 gap-2 max-w-[340px]'}`}
        >
          {content.features.map((item, i) => (
            <div
              key={item.title}
              className="opacity-0 auth-card-entrance w-full"
              style={{
                animationDelay: `${isLogin ? 0.6 + i * 0.12 : 0.8 + i * 0.08}s`,
                animationFillMode: 'forwards',
              }}
            >
              <div
                className="auth-feature-card flex items-center gap-3 rounded-[11px] border transition-all duration-300 auth-card-funky hover:scale-[1.02] backdrop-blur-md"
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  borderColor: 'rgba(255,255,255,0.07)',
                  padding: isLogin ? '14px 16px' : '12px 10px',
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center rounded-lg transition-transform duration-300"
                  style={{
                    width: isLogin ? 34 : 30,
                    height: isLogin ? 34 : 30,
                    background: 'rgba(74,144,226,0.10)',
                    border: '1px solid rgba(74,144,226,0.15)',
                  }}
                >
                  <item.icon className="w-[18px] h-[18px]" style={{ color: '#4a90e2' }} />
                </div>
                <div className="min-w-0">
                  <p className="font-sans font-medium text-white" style={{ fontSize: isLogin ? 13 : 12 }}>
                    {item.title}
                  </p>
                  <p className="font-sans text-white/70 mt-0.5" style={{ fontSize: isLogin ? 12 : 11 }}>
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p
        className="relative z-10 font-sans text-[12px] mt-6 text-white/60 opacity-0 auth-fade-in-up"
        style={{ animationDelay: '1s', animationFillMode: 'forwards' }}
      >
        © 2025 <span className="font-semibold">Insync</span><span style={{ color: 'var(--gold)' }}>X</span>. All rights reserved.
      </p>
    </div>
  );
}
