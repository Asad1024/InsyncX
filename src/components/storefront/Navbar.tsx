'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Heart,
  Menu,
  LayoutDashboard,
  ShoppingCart,
  Store,
  Shield,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useUIStore } from '@/store/ui.store';
import { useCart } from '@/hooks/useCart';
import { Logo } from '@/components/storefront/Logo';

type NavCategory = { id: string; name: string; slug: string };
type NavStore = { name: string; slug: string };

interface NavbarProps {
  categories?: NavCategory[];
  stores?: NavStore[];
}

const QUICK_LINKS = [
  { label: 'New Arrivals', href: '/shop?new=1' },
  { label: 'Women', href: '/shop?category=women' },
  { label: 'Men', href: '/shop?category=men' },
  { label: 'Accessories', href: '/shop?category=accessories' },
];

export function Navbar({ categories = [], stores = [] }: NavbarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { getCount, toggleCart } = useCartStore();
  const { toggleSearch, setMobileMenuOpen } = useUIStore();
  const count = getCount();
  useCart();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const capsuleRef = useRef<HTMLDivElement | null>(null);
  const [megaTop, setMegaTop] = useState(96);

  const { scrollY } = useScroll();
  /* Subtle shrink only; stay large and readable over content */
  const capsuleScale = useTransform(scrollY, [0, 200], [1, 0.97]);
  const capsuleOpacity = useTransform(scrollY, [0, 280], [1, 0.98]);

  const updateMegaTop = useCallback(() => {
    const el = capsuleRef.current;
    if (!el) return;
    setMegaTop(Math.round(el.getBoundingClientRect().bottom + 10));
  }, []);

  useEffect(() => {
    updateMegaTop();
    window.addEventListener('scroll', updateMegaTop, { passive: true });
    window.addEventListener('resize', updateMegaTop);
    const ro = new ResizeObserver(updateMegaTop);
    if (capsuleRef.current) ro.observe(capsuleRef.current);
    return () => {
      window.removeEventListener('scroll', updateMegaTop);
      window.removeEventListener('resize', updateMegaTop);
      ro.disconnect();
    };
  }, [updateMegaTop]);

  const navLinkBase =
    'font-sans text-[11px] font-medium uppercase tracking-[0.14em] py-1 px-2 rounded-full text-[var(--muted)] hover:text-[var(--white)] transition-[var(--ease)] shrink-0';
  const navLinkActive = 'insync-nav-link-active';

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const capsuleSurface = scrolled
    ? {
        background: 'rgba(6,18,50,0.52)',
        borderColor: 'rgba(255,255,255,0.14)',
        boxShadow:
          '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 36px rgba(29,110,255,0.1)',
      }
    : {
        background: 'rgba(6,18,50,0.28)',
        borderColor: 'rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset',
      };

  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="pointer-events-none flex justify-center px-2 pb-1 pt-[max(15px,env(safe-area-inset-top,0px))] sm:px-3">
        <motion.div
          ref={capsuleRef}
          className="insync-nav-bento-capsule pointer-events-auto flex w-full max-w-[min(100vw-0.75rem,72rem)] items-center gap-0.5 rounded-full border border-white/10 py-0.5 pl-1.5 pr-0.5 sm:gap-1 sm:py-1 sm:pl-2.5 sm:pr-1 md:py-1"
          style={{
            ...capsuleSurface,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            scale: capsuleScale,
            opacity: capsuleOpacity,
            transformOrigin: '50% 0%',
          }}
        >
          <Logo height={36} className="min-w-0" />

          <span
            className="mx-0.5 hidden h-7 w-px shrink-0 sm:mx-1 sm:block"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.12), transparent)' }}
            aria-hidden
          />

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex">
            <Link
              href="/shop"
              className={`${navLinkBase} ${pathname === '/shop' && !pathname.includes('/product') ? navLinkActive : ''}`}
            >
              Shop
            </Link>
            <Link href="/shop?featured=1" className={navLinkBase}>
              Featured
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <span
                className={`inline-flex cursor-default items-center ${navLinkBase} ${categoriesOpen ? navLinkActive : ''}`}
                aria-expanded={categoriesOpen}
                aria-haspopup="true"
              >
                Collections
              </span>

              <div
                className="fixed left-0 right-0 z-[100] w-full border-b shadow-[var(--shadow-lg)] py-8 px-6 sm:px-10 lg:px-12"
                style={{
                  top: megaTop,
                  borderBottomColor: 'rgba(29,110,255,0.15)',
                  opacity: categoriesOpen ? 1 : 0,
                  pointerEvents: categoriesOpen ? 'auto' : 'none',
                  transition: 'opacity 0.22s ease',
                  background: 'rgba(2,10,24,0.78)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-10 px-2 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4">
                  <div>
                    <p
                      className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
                      style={{ marginBottom: 16 }}
                    >
                      Shop by Category
                    </p>
                    <ul className="flex flex-col gap-0">
                      {categories.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/shop?category=${encodeURIComponent(c.slug)}`}
                            className="group/link flex items-center gap-2 py-[7px] font-sans text-[13px] text-[var(--muted)] transition-[var(--ease)] hover:text-[var(--white)]"
                            onClick={() => setCategoriesOpen(false)}
                          >
                            {c.name}
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href="/shop?featured=1"
                          className="group/link flex items-center gap-2 py-[7px] font-sans text-[13px] text-[var(--muted)] transition-[var(--ease)] hover:text-[var(--white)]"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          Sale & Offers
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p
                      className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
                      style={{ marginBottom: 16 }}
                    >
                      Featured Stores
                    </p>
                    <ul className="flex flex-col gap-0">
                      {stores.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={`/store/${s.slug}`}
                            className="group/link flex items-center gap-2 py-[7px] font-sans text-[13px] text-[var(--muted)] transition-[var(--ease)] hover:text-[var(--white)]"
                            onClick={() => setCategoriesOpen(false)}
                          >
                            {s.name}
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
                          </Link>
                        </li>
                      ))}
                      {stores.length === 0 && (
                        <li className="py-[7px] font-sans text-[13px] text-[var(--muted)]">No stores yet</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <p
                      className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
                      style={{ marginBottom: 16 }}
                    >
                      Quick Links
                    </p>
                    <ul className="flex flex-col gap-0">
                      {QUICK_LINKS.map(({ label, href }) => (
                        <li key={label}>
                          <Link
                            href={href}
                            className="group/link flex items-center gap-2 py-[7px] font-sans text-[13px] text-[var(--muted)] transition-[var(--ease)] hover:text-[var(--white)]"
                            onClick={() => setCategoriesOpen(false)}
                          >
                            {label}
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="rounded-[14px] border p-5"
                    style={{
                      background: 'rgba(29,110,255,0.06)',
                      borderColor: 'rgba(29,110,255,0.2)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--cyan)]">
                      Limited Offer
                    </p>
                    <p className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.04em] text-[var(--white)]">
                      INSYNCX143
                    </p>
                    <p className="mt-1 font-sans text-[12px] text-[var(--muted)]">20% off your order</p>
                    <Link
                      href="/shop"
                      onClick={() => setCategoriesOpen(false)}
                      className="btn btn-primary btn-sm mt-3"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <span
            className="mx-0.5 hidden h-7 w-px shrink-0 sm:mx-1 sm:block"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.12), transparent)' }}
            aria-hidden
          />

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={toggleSearch}
              aria-label="Search"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-none bg-transparent text-[var(--muted)] transition-[var(--ease)] hover:bg-white/[0.04] hover:text-[var(--cyan)]"
            >
              <Search className="h-[20px] w-[20px]" strokeWidth={1.5} />
            </button>
            {status === 'authenticated' && (
              <Link
                href="/account/wishlist"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-[var(--ease)] hover:bg-white/[0.04] ${
                  pathname.startsWith('/account/wishlist')
                    ? 'insync-nav-icon-active'
                    : 'text-[var(--muted)] hover:text-[var(--cyan)]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className="h-[20px] w-[20px]" strokeWidth={1.5} />
              </Link>
            )}
            <button
              type="button"
              onClick={toggleCart}
              aria-label="Cart"
              className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-none bg-transparent text-[var(--muted)] transition-[var(--ease)] hover:bg-white/[0.04] hover:text-[var(--cyan)]"
            >
              <ShoppingBag className="h-[20px] w-[20px]" strokeWidth={1.5} />
              {count > 0 && (
                <span
                  className="absolute flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-sans text-[9px] font-bold text-white animate-scale-in"
                  style={{
                    top: 4,
                    right: 2,
                    background: 'linear-gradient(135deg, var(--blue), var(--blue-mid))',
                    boxShadow: '0 0 14px rgba(29,110,255,0.55)',
                  }}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>

            <div
              className="mx-0.5 hidden h-6 w-px shrink-0 sm:block"
              style={{ background: 'rgba(29,110,255,0.18)' }}
            />

            {status === 'authenticated' ? (
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border font-sans text-[12px] font-semibold text-[var(--cyan)] transition-[var(--ease)]"
                  style={{
                    background: (session?.user as { image?: string })?.image ? 'transparent' : 'rgba(29,110,255,0.08)',
                    borderColor: 'rgba(29,110,255,0.28)',
                    boxShadow: '0 0 14px rgba(29,110,255,0.22)',
                  }}
                >
                  {(session?.user as { image?: string })?.image ? (
                    <img
                      src={(session.user as { image?: string }).image}
                      alt=""
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    (session?.user?.name ?? 'U').slice(0, 2).toUpperCase()
                  )}
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[199]" aria-hidden onClick={() => setUserMenuOpen(false)} />
                    <div
                      className="absolute right-0 z-[200] min-w-[200px] rounded-[14px] border p-2 shadow-[var(--shadow-lg)]"
                      style={{
                        top: 'calc(100% + 10px)',
                        background: 'rgba(6,18,50,0.88)',
                        borderColor: 'rgba(29,110,255,0.22)',
                        backdropFilter: 'blur(20px)',
                      }}
                    >
                      <div className="mb-2 border-b px-3 py-3" style={{ borderColor: 'rgba(29,110,255,0.15)' }}>
                        <p className="font-sans text-[14px] font-medium text-[var(--text)]">
                          {session?.user?.name ?? 'User'}
                        </p>
                        <p className="mt-0.5 font-sans text-[12px] text-[var(--text-3)]">{session?.user?.email ?? ''}</p>
                      </div>
                      {(session?.user?.role === 'CUSTOMER' || !session?.user?.role) && (
                        <>
                          <Link
                            href="/account"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-sans text-[13px] font-medium text-[var(--muted)] transition-[var(--ease)] hover:text-[var(--white)]"
                          >
                            <LayoutDashboard className="h-[15px] w-[15px]" />
                            Dashboard
                          </Link>
                          <Link
                            href="/account/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-sans text-[13px] font-medium text-[var(--muted)] transition-[var(--ease)] hover:text-[var(--white)]"
                          >
                            <ShoppingCart className="h-[15px] w-[15px]" />
                            Orders
                          </Link>
                        </>
                      )}
                      {session?.user?.role === 'VENDOR' && (
                        <Link
                          href="/vendor"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-sans text-[13px] font-medium text-[var(--muted)] transition-[var(--ease)] hover:text-[var(--white)]"
                        >
                          <Store className="h-[15px] w-[15px]" />
                          Vendor Portal
                        </Link>
                      )}
                      {session?.user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-sans text-[13px] font-medium text-[var(--muted)] transition-[var(--ease)] hover:text-[var(--white)]"
                        >
                          <Shield className="h-[15px] w-[15px]" />
                          Admin Panel
                        </Link>
                      )}
                      <div className="my-2 h-px" style={{ background: 'rgba(29,110,255,0.15)' }} />
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 font-sans text-[13px] font-medium text-[var(--red)] transition-[var(--ease)] hover:bg-[rgba(239,68,68,0.08)]"
                      >
                        <LogOut className="h-[15px] w-[15px]" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden rounded-full px-3 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)] transition-[var(--ease)] hover:bg-white/[0.06] hover:text-[var(--white)] lg:inline"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition-[var(--ease)] hover:bg-white/[0.04] hover:text-[var(--cyan)] lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
