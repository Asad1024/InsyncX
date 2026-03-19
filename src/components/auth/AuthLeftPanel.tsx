'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Store, Shield, Heart, LayoutDashboard, Package, Tag } from 'lucide-react';

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
      className="hidden lg:flex flex-col justify-between pt-8 pb-12 px-14 relative overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, var(--surface) 0%, var(--surface2) 50%, #0f0f12 100%)',
        borderRight: '1px solid var(--line)',
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
          background: 'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(212,168,67,0.08) 0%, transparent 50%)',
        }}
        aria-hidden
      />
      {/* Logo at top center — less space below on register */}
      <div className={`relative z-10 w-full flex justify-center ${isLogin ? 'mb-6' : 'mb-2'}`}>
        <div className="relative shrink-0" style={{ width: 300, height: 76 }}>
          <Image
            src="/InsyncX%20logo.avif"
            alt="InsyncX"
            fill
            className="object-contain object-center"
            sizes="300px"
            priority
          />
        </div>
      </div>
      <div className={`relative z-10 flex-1 flex flex-col justify-center min-h-0 ${isLogin ? '-mt-2' : '-mt-1'}`}>
        <h1
          className="font-display text-[42px] lg:text-[48px] font-light leading-[1.15] tracking-tight text-white opacity-0 auth-fade-in-up"
          style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}
        >
          {content.headline.includes('InsyncX') ? (
            <>
              {content.headline.split('InsyncX')[0]}
              <span className="font-semibold">Insync</span>
              <span style={{ color: 'var(--gold)' }}>X</span>
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
          style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}
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
      </div>

      <div className="relative z-10 flex flex-col gap-3 mt-6">
        {content.features.map((item, i) => (
          <div
            key={item.title}
            className="opacity-0 auth-card-entrance w-full max-w-[320px]"
            style={{
              animationDelay: `${0.6 + i * 0.12}s`,
              animationFillMode: 'forwards',
            }}
          >
            <div
              className="flex items-center gap-3 rounded-xl py-3.5 px-4 border border-white/15 transition-all duration-300 auth-card-funky hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              >
                <item.icon className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <div>
                <p className="font-sans text-[13px] font-medium text-white">
                  {item.title}
                </p>
                <p className="font-sans text-[12px] mt-0.5 text-white/70">
                  {item.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
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
