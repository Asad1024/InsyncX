'use client';

import Link from 'next/link';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useUIStore } from '@/store/ui.store';
import { useSession, signOut } from 'next-auth/react';
import { X, ShoppingBag, Star, LayoutGrid, LayoutDashboard, ShoppingCart, Heart } from 'lucide-react';

const MENU_LINKS = [
  { label: 'Shop', href: '/shop', icon: ShoppingBag },
  { label: 'New Arrivals', href: '/shop?new=1', icon: Star },
  { label: 'Featured', href: '/shop?featured=1', icon: Star },
  { label: 'Collections', href: '/shop', icon: LayoutGrid },
];

const CATEGORY_LINKS = [
  { label: 'New Arrivals', href: '/shop?new=1' },
  { label: 'Women', href: '/shop?category=women' },
  { label: 'Men', href: '/shop?category=men' },
  { label: 'Accessories', href: '/shop?category=accessories' },
  { label: 'LGBTQ+', href: '/shop?category=lgbtq' },
  { label: 'Wellness', href: '/shop?category=wellness' },
  { label: 'Party', href: '/shop?category=party' },
  { label: 'Exotic', href: '/shop?category=exotic' },
  { label: 'Sale', href: '/shop?featured=1' },
];

const ACCOUNT_LINKS = [
  { label: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { label: 'Orders', href: '/account/orders', icon: ShoppingCart },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
];

export function MobileDrawer() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { data: session, status } = useSession();

  useBodyScrollLock(mobileMenuOpen);

  if (!mobileMenuOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
        }}
        aria-hidden
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* Drawer panel */}
      <div
        className="fixed top-0 left-0 bottom-0 z-[401] md:hidden w-[min(320px,85vw)] flex flex-col bg-[var(--surface)] border-r transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        style={{
          borderRightColor: 'var(--line-md)',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between py-5 px-5 border-b" style={{ borderColor: 'var(--line)' }}>
          <span className="font-display text-[20px] font-normal text-[var(--text)]">
            InsyncX
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--surface2)] border-none text-[var(--text-3)] hover:text-[var(--text)] transition-[var(--ease)]"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-4)] pt-4 pb-2 px-2 mt-2">
            Menu
          </p>
          {MENU_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-2 rounded-lg font-sans text-[14px] font-medium text-[var(--text-3)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-[var(--ease)]"
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </Link>
          ))}

          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-4)] pt-4 pb-2 px-2 mt-2">
            Categories
          </p>
          {CATEGORY_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-2 rounded-lg font-sans text-[14px] font-medium text-[var(--text-3)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-[var(--ease)]"
            >
              {label}
            </Link>
          ))}

          {status === 'authenticated' && (
            <>
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-4)] pt-4 pb-2 px-2 mt-2">
                Account
              </p>
              {ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-2 rounded-lg font-sans text-[14px] font-medium text-[var(--text-3)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-[var(--ease)]"
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="py-4 px-3 border-t" style={{ borderColor: 'var(--line)' }}>
          {status === 'authenticated' ? (
            <>
              <p className="font-sans text-[13px] font-medium text-[var(--text)] mb-1">
                {session?.user?.name ?? 'User'}
              </p>
              <p className="font-sans text-[12px] text-[var(--text-3)] mb-4">
                {session?.user?.email ?? ''}
              </p>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="btn btn-ghost btn-full btn-sm text-[var(--red)]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary btn-full btn-sm mb-2"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-ghost btn-full btn-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
