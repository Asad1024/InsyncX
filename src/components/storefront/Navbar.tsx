'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
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

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navLinkBase =
    'font-sans text-[12px] font-medium uppercase tracking-[0.15em] py-2 px-3 rounded-[8px] text-[var(--muted)] hover:text-[var(--white)] transition-[var(--ease)]';
  const navLinkActive = '!text-[var(--white)]';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full h-[var(--nav-h)] border-b"
      style={{
        background: 'rgba(2,10,24,0.65)',
        borderBottomColor: 'rgba(29,110,255,0.15)',
        backdropFilter: 'blur(28px)',
      }}
    >
      <div
        className="grid items-center h-full max-w-[var(--content-max)] mx-auto px-6 md:px-10 lg:px-12"
        style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
      >
        {/* Left: Logo */}
        <div className="flex justify-start">
          <Logo height={72} />
        </div>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden lg:flex items-center gap-2 justify-center">
          <Link
            href="/"
            className={`${navLinkBase} ${isActive('/', true) ? navLinkActive : ''}`}
          >
            Home
          </Link>
          <Link
            href="/shop"
            className={`${navLinkBase} ${pathname === '/shop' && !pathname.includes('/product') ? navLinkActive : ''}`}
          >
            Shop
          </Link>
          <Link href="/shop?featured=1" className={navLinkBase}>
            Featured
          </Link>

          {/* Collections — hover mega dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <span
              className={`inline-flex items-center ${navLinkBase} ${categoriesOpen ? navLinkActive : ''}`}
              aria-expanded={categoriesOpen}
              aria-haspopup="true"
            >
              Collections
            </span>

            <div
              className="fixed left-0 right-0 w-full bg-[var(--surface)] border-b shadow-[var(--shadow-lg)] py-8 px-12 z-[100]"
              style={{
                top: 'var(--nav-h)',
                borderBottomColor: 'rgba(29,110,255,0.15)',
                opacity: categoriesOpen ? 1 : 0,
                pointerEvents: categoriesOpen ? 'auto' : 'none',
                transition: 'opacity 0.2s ease',
                background: 'rgba(2,10,24,0.72)',
                backdropFilter: 'blur(28px)',
              }}
            >
              <div
                className="grid gap-12 max-w-[900px] mx-auto px-4"
                style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
              >
                {/* Shop by Category */}
                <div>
                  <p
                    className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] mb-4"
                    style={{ marginBottom: 16 }}
                  >
                    Shop by Category
                  </p>
                  <ul className="flex flex-col gap-0">
                    {categories.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/shop?category=${encodeURIComponent(c.slug)}`}
                          className="flex items-center gap-2 font-sans text-[13px] text-[var(--muted)] py-[7px] hover:text-[var(--white)] transition-[var(--ease)] group/link"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          {c.name}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/shop?featured=1"
                        className="flex items-center gap-2 font-sans text-[13px] text-[var(--muted)] py-[7px] hover:text-[var(--white)] transition-[var(--ease)] group/link"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        Sale & Offers
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Featured Stores */}
                <div>
                  <p
                    className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] mb-4"
                    style={{ marginBottom: 16 }}
                  >
                    Featured Stores
                  </p>
                  <ul className="flex flex-col gap-0">
                    {stores.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/store/${s.slug}`}
                          className="flex items-center gap-2 font-sans text-[13px] text-[var(--muted)] py-[7px] hover:text-[var(--white)] transition-[var(--ease)] group/link"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          {s.name}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                        </Link>
                      </li>
                    ))}
                    {stores.length === 0 && (
                      <li className="font-sans text-[13px] text-[var(--muted)] py-[7px]">No stores yet</li>
                    )}
                  </ul>
                </div>

                {/* Quick Links */}
                <div>
                  <p
                    className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] mb-4"
                    style={{ marginBottom: 16 }}
                  >
                    Quick Links
                  </p>
                  <ul className="flex flex-col gap-0">
                    {QUICK_LINKS.map(({ label, href }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="flex items-center gap-2 font-sans text-[13px] text-[var(--muted)] py-[7px] hover:text-[var(--white)] transition-[var(--ease)] group/link"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          {label}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Promo box */}
                <div
                  className="rounded-[14px] p-5 border"
                  style={{
                    background: 'rgba(29,110,255,0.06)',
                    borderColor: 'rgba(29,110,255,0.2)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--cyan)]">
                    Limited Offer
                  </p>
                  <p className="font-display text-[28px] font-extrabold text-[var(--white)] mt-1 tracking-[-0.04em]">INSYNCX143</p>
                  <p className="font-sans text-[12px] text-[var(--muted)] mt-1">20% off your order</p>
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

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 justify-end">
          <button
            type="button"
            onClick={toggleSearch}
            aria-label="Search"
            className="w-11 h-11 rounded-lg bg-transparent border-none text-[var(--muted)] hover:text-[var(--cyan)] transition-[var(--ease)] cursor-pointer flex items-center justify-center"
          >
            <Search className="w-[22px] h-[22px]" strokeWidth={1.5} />
          </button>
          {status === 'authenticated' && (
            <Link
              href="/account/wishlist"
              className="w-11 h-11 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--cyan)] transition-[var(--ease)]"
              aria-label="Wishlist"
            >
              <Heart className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </Link>
          )}
          <button
            type="button"
            onClick={toggleCart}
            aria-label="Cart"
            className="relative w-11 h-11 rounded-lg bg-transparent border-none text-[var(--muted)] hover:text-[var(--cyan)] transition-[var(--ease)] cursor-pointer flex items-center justify-center"
          >
            <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={1.5} />
            {count > 0 && (
              <span
                className="absolute rounded-full text-white font-sans text-[10px] font-bold flex items-center justify-center w-5 h-5 animate-scale-in"
                style={{
                  top: 6,
                  right: 6,
                  background: 'linear-gradient(135deg, var(--blue), var(--blue-mid))',
                  boxShadow: '0 0 18px rgba(29,110,255,0.55)',
                }}
              >
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>

          <div
            className="w-px h-6 mx-2 shrink-0"
            style={{ background: 'rgba(29,110,255,0.18)' }}
          />

          {status === 'authenticated' ? (
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="w-10 h-10 rounded-full flex items-center justify-center font-sans text-[13px] font-semibold text-[var(--cyan)] shrink-0 border transition-[var(--ease)] overflow-hidden"
                style={{
                  background: (session?.user as { image?: string })?.image ? 'transparent' : 'rgba(29,110,255,0.06)',
                  borderColor: 'rgba(29,110,255,0.25)',
                  boxShadow: '0 0 18px rgba(29,110,255,0.25)',
                }}
              >
                {(session?.user as { image?: string })?.image ? (
                  <img
                    src={(session.user as { image?: string }).image}
                    alt=""
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  (session?.user?.name ?? 'U').slice(0, 2).toUpperCase()
                )}
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[199]"
                    aria-hidden
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div
                    className="absolute right-0 rounded-[14px] border shadow-[var(--shadow-lg)] p-2 min-w-[200px] z-[200]"
                    style={{
                      top: 'calc(100% + 8px)',
                      background: 'rgba(6,18,50,0.75)',
                      borderColor: 'rgba(29,110,255,0.2)',
                      backdropFilter: 'blur(24px)',
                    }}
                  >
                    <div
                      className="px-3 py-3 border-b mb-2"
                      style={{ borderColor: 'rgba(29,110,255,0.15)' }}
                    >
                      <p className="font-sans text-[14px] font-medium text-[var(--text)]">
                        {session?.user?.name ?? 'User'}
                      </p>
                      <p className="font-sans text-[12px] text-[var(--text-3)] mt-0.5">
                        {session?.user?.email ?? ''}
                      </p>
                    </div>
                    {(session?.user?.role === 'CUSTOMER' || !session?.user?.role) && (
                      <>
                        <Link
                          href="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-sans text-[13px] font-medium text-[var(--muted)] hover:text-[var(--white)] transition-[var(--ease)]"
                        >
                          <LayoutDashboard className="w-[15px] h-[15px]" />
                          Dashboard
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-sans text-[13px] font-medium text-[var(--muted)] hover:text-[var(--white)] transition-[var(--ease)]"
                        >
                          <ShoppingCart className="w-[15px] h-[15px]" />
                          Orders
                        </Link>
                      </>
                    )}
                    {session?.user?.role === 'VENDOR' && (
                      <Link
                        href="/vendor"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-sans text-[13px] font-medium text-[var(--muted)] hover:text-[var(--white)] transition-[var(--ease)]"
                      >
                        <Store className="w-[15px] h-[15px]" />
                        Vendor Portal
                      </Link>
                    )}
                    {session?.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-sans text-[13px] font-medium text-[var(--muted)] hover:text-[var(--white)] transition-[var(--ease)]"
                      >
                        <Shield className="w-[15px] h-[15px]" />
                        Admin Panel
                      </Link>
                    )}
                    <div
                      className="my-2 h-px"
                      style={{ background: 'rgba(29,110,255,0.15)' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg font-sans text-[13px] font-medium text-[var(--red)] hover:bg-[rgba(239,68,68,0.08)] transition-[var(--ease)]"
                    >
                      <LogOut className="w-[15px] h-[15px]" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden lg:inline font-sans text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--muted)] py-2 px-3 rounded-[8px] hover:text-[var(--white)] transition-[var(--ease)]"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            className="lg:hidden w-11 h-11 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--cyan)] transition-[var(--ease)]"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
